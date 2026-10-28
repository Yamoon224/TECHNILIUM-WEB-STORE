import { afterEach, describe, expect, it, vi } from "vitest";
import { requestReturn, returnableQuantities, returnItemsPayload, ReturnsError } from "./returns";

afterEach(() => vi.unstubAllGlobals());

const sold = [
  { offer_id: 1, quantity: 2 },
  { offer_id: 2, quantity: 1 },
];

describe("returnableQuantities", () => {
  it("starts from what the order sold", () => {
    expect([...returnableQuantities(sold, [])]).toEqual([
      [1, 2],
      [2, 1],
    ]);
  });

  it("subtracts what other returns already claim, rejected ones excepted", () => {
    const left = returnableQuantities(sold, [
      { status: "requested", items: [{ offer_id: 1, quantity: 1 }] },
      { status: "rejected", items: [{ offer_id: 2, quantity: 1 }] },
    ]);

    expect(left.get(1)).toBe(1);
    expect(left.get(2)).toBe(1);
  });

  it("never goes below zero and ignores offers not in the order", () => {
    const left = returnableQuantities(sold, [
      { status: "refunded", items: [{ offer_id: 1, quantity: 5 }, { offer_id: 99, quantity: 1 }] },
    ]);

    expect(left.get(1)).toBe(0);
    expect(left.has(99)).toBe(false);
  });
});

describe("returnItemsPayload", () => {
  it("keeps only articles with a quantity", () => {
    expect(
      returnItemsPayload(
        new Map([
          [1, 2],
          [2, 0],
        ]),
      ),
    ).toEqual([{ offer_id: 1, quantity: 2 }]);
  });
});

describe("requestReturn", () => {
  it("posts the articles and the reason, never an amount", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });
    vi.stubGlobal("fetch", fetchMock);

    await requestReturn("tok", { order_number: "TCH-1", reason: "Écran cassé", items: [{ offer_id: 1, quantity: 1 }] });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/customer/returns");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(JSON.parse(init.body)).toEqual({ order_number: "TCH-1", reason: "Écran cassé", items: [{ offer_id: 1, quantity: 1 }] });
  });

  it("surfaces the server's message on refusal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: "Le délai de retour de 14 jours est dépassé." }) }));

    await expect(requestReturn("tok", { order_number: "X", reason: "Écran cassé", items: [] })).rejects.toThrow(/délai/);
  });

  it("surfaces the first validation error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: "x", errors: { reason: ["Motif trop court."] } }) }));

    await expect(requestReturn("tok", { order_number: "X", reason: "ab", items: [] })).rejects.toBeInstanceOf(ReturnsError);
  });
});
