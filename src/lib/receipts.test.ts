import { afterEach, describe, expect, it, vi } from "vitest";
import { listOrderReceipts, receiptFilename, ReceiptsError } from "./receipts";

afterEach(() => vi.unstubAllGlobals());

describe("receiptFilename", () => {
  it("names the file after the receipt number", () => {
    expect(receiptFilename({ number: "REC-000012" })).toBe("REC-000012.pdf");
  });
});

describe("listOrderReceipts", () => {
  it("sends the token and returns the receipts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [{ id: 1, number: "REC-000001" }] }) });
    vi.stubGlobal("fetch", fetchMock);

    expect(await listOrderReceipts("tok", "TCH 1")).toHaveLength(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/customer/orders/TCH%201/receipts");
    expect(init.headers.Authorization).toBe("Bearer tok");
  });

  it("throws when the order is not the customer's", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    await expect(listOrderReceipts("tok", "X")).rejects.toBeInstanceOf(ReceiptsError);
  });
});
