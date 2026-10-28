/**
 * The customer's own returns (backend Returns module, `/customer/...`).
 * The customer names articles and a reason; the amount is computed by the
 * server, and the staff decides what happens next.
 */

import type { CurrencyCode } from "./money";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type ReturnStatus = "requested" | "accepted" | "received" | "refunded" | "rejected";

export interface CustomerReturn {
  id: number;
  number: string;
  order_number: string;
  status: ReturnStatus;
  reason: string;
  decision_note: string | null;
  currency: CurrencyCode;
  requested_amount: number;
  refunded_amount: number;
  items: { offer_id: number; quantity: number }[];
  refunded_at: string | null;
  created_at: string | null;
}

export class ReturnsError extends Error {}

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  requested: "Demande envoyée, en attente de réponse",
  accepted: "Acceptée : renvoyez le colis",
  received: "Colis reçu, en cours de vérification",
  refunded: "Remboursée",
  rejected: "Refusée",
};

/**
 * How many of each offer the customer may still ask to return: what the order
 * sold, minus what their other (not rejected) returns already claim. A hint to
 * shape the form — the server decides.
 */
export function returnableQuantities(
  items: readonly { offer_id: number; quantity: number }[],
  returns: readonly Pick<CustomerReturn, "status" | "items">[],
): Map<number, number> {
  const left = new Map<number, number>();

  for (const item of items) {
    left.set(item.offer_id, (left.get(item.offer_id) ?? 0) + item.quantity);
  }

  for (const request of returns) {
    if (request.status === "rejected") continue;
    for (const claim of request.items) {
      if (left.has(claim.offer_id)) {
        left.set(claim.offer_id, Math.max(0, (left.get(claim.offer_id) ?? 0) - claim.quantity));
      }
    }
  }

  return left;
}

/** The request body's articles: only offers with a quantity above zero. */
export function returnItemsPayload(quantities: ReadonlyMap<number, number>): { offer_id: number; quantity: number }[] {
  return [...quantities.entries()]
    .filter(([, quantity]) => quantity > 0)
    .map(([offer_id, quantity]) => ({ offer_id, quantity }));
}

async function readMessage(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
    errors?: Record<string, string[]>;
  } | null;
  return body?.errors ? (Object.values(body.errors)[0]?.[0] ?? fallback) : (body?.message ?? fallback);
}

export async function listOrderReturns(token: string, orderNumber: string): Promise<CustomerReturn[]> {
  const response = await fetch(`${API_BASE_URL}/customer/orders/${encodeURIComponent(orderNumber)}/returns`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new ReturnsError("Retours indisponibles.");

  const body = (await response.json()) as { data: CustomerReturn[] };
  return body.data;
}

export async function requestReturn(
  token: string,
  input: { order_number: string; reason: string; items: { offer_id: number; quantity: number }[] },
): Promise<CustomerReturn> {
  const response = await fetch(`${API_BASE_URL}/customer/returns`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new ReturnsError(await readMessage(response, "La demande de retour n'a pas pu être envoyée."));

  return response.json() as Promise<CustomerReturn>;
}
