/**
 * The customer's own invoices and credit notes (backend Invoicing module,
 * `/customer/...`). Staff issue them; the customer can only list and
 * download the ones tied to their own orders.
 */

import type { CurrencyCode } from "./money";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type InvoiceType = "invoice" | "credit_note";

export interface CustomerInvoice {
  id: number;
  number: string;
  type: InvoiceType;
  total_amount: number;
  currency: CurrencyCode;
  reason: string | null;
  issued_at: string;
}

export class InvoicesError extends Error {}

export const INVOICE_TYPE_LABEL: Record<InvoiceType, string> = {
  invoice: "Facture",
  credit_note: "Avoir",
};

/** "FAC-2026-000042" -> "FAC-2026-000042.pdf", matching the server's Content-Disposition. */
export function pdfFilename(invoice: Pick<CustomerInvoice, "number">): string {
  return `${invoice.number}.pdf`;
}

export async function listOrderInvoices(token: string, orderNumber: string): Promise<CustomerInvoice[]> {
  const response = await fetch(`${API_BASE_URL}/customer/orders/${encodeURIComponent(orderNumber)}/invoices`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new InvoicesError("Factures indisponibles.");

  const body = (await response.json()) as { data: CustomerInvoice[] };
  return body.data;
}

/** The PDF needs the bearer token, so it is fetched and saved as a blob rather than linked. */
export async function downloadInvoicePdf(token: string, invoice: Pick<CustomerInvoice, "id" | "number">): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/customer/invoices/${invoice.id}/pdf`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
  });
  if (!response.ok) throw new InvoicesError("Le PDF n'a pas pu être téléchargé.");

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = pdfFilename(invoice);
  link.click();
  URL.revokeObjectURL(url);
}
