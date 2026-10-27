import { afterEach, describe, expect, it, vi } from "vitest";
import { listOrderInvoices, pdfFilename, InvoicesError } from "./invoices";

afterEach(() => vi.unstubAllGlobals());

describe("pdfFilename", () => {
  it("names the file after the document number", () => {
    expect(pdfFilename({ number: "FAC-2026-000042" })).toBe("FAC-2026-000042.pdf");
  });
});

describe("listOrderInvoices", () => {
  it("returns the documents and sends the bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [{ id: 1, number: "FAC-1" }] }) });
    vi.stubGlobal("fetch", fetchMock);

    const documents = await listOrderInvoices("tok", "TCH 1/2");

    expect(documents).toHaveLength(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/customer/orders/TCH%201%2F2/invoices");
    expect(init.headers.Authorization).toBe("Bearer tok");
  });

  it("throws a readable error when the order is not the customer's", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    await expect(listOrderInvoices("tok", "X")).rejects.toBeInstanceOf(InvoicesError);
  });
});
