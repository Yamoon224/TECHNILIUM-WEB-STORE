/**
 * The customer's own payment receipts (backend Payments module, `/customer/...`):
 * only for money actually received, only on their own orders.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface CustomerReceipt {
  id: number;
  number: string;
  method: string;
  amount_amount: number;
  currency: string;
  paid_at: string | null;
}

export class ReceiptsError extends Error {}

/** "REC-000012" -> "REC-000012.pdf", matching the server's Content-Disposition. */
export function receiptFilename(receipt: Pick<CustomerReceipt, "number">): string {
  return `${receipt.number}.pdf`;
}

export async function listOrderReceipts(token: string, orderNumber: string): Promise<CustomerReceipt[]> {
  const response = await fetch(`${API_BASE_URL}/customer/orders/${encodeURIComponent(orderNumber)}/receipts`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new ReceiptsError("Reçus indisponibles.");

  const body = (await response.json()) as { data: CustomerReceipt[] };
  return body.data;
}

/** The PDF needs the bearer token, so it is fetched and saved as a blob rather than linked. */
export async function downloadReceiptPdf(token: string, receipt: Pick<CustomerReceipt, "id" | "number">): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/customer/payments/${receipt.id}/receipt`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
  });
  if (!response.ok) throw new ReceiptsError("Le PDF n'a pas pu être téléchargé.");

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = receiptFilename(receipt);
  link.click();
  URL.revokeObjectURL(url);
}
