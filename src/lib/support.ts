/**
 * The customer's side of support (backend Customers module, `/support/tickets`).
 * Every call is scoped by the API to the authenticated account.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type TicketStatus = "open" | "pending_customer" | "resolved" | "closed";
export type TicketCategory = "order" | "payment" | "delivery" | "product" | "warranty" | "other";

export const CATEGORY_LABEL: Record<TicketCategory, string> = {
  order: "Ma commande",
  payment: "Paiement",
  delivery: "Livraison",
  product: "Un produit",
  warranty: "Garantie / SAV",
  other: "Autre question",
};

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Reçu - en cours de traitement",
  pending_customer: "En attente de votre réponse",
  resolved: "Résolu",
  closed: "Clos",
};

export interface TicketMessage {
  id: number;
  from: "customer" | "support";
  body: string;
  created_at: string | null;
}

export interface Ticket {
  id: number;
  number: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  order_number: string | null;
  created_at: string | null;
  updated_at: string | null;
  messages?: TicketMessage[];
}

export class SupportError extends Error {}

/** A closed ticket is final; every other status accepts a reply (a resolved one is reopened by it). */
export function canReply(status: TicketStatus): boolean {
  return status !== "closed";
}

/** True when the team is waiting for the customer: worth highlighting in the list. */
export function needsYourReply(status: TicketStatus): boolean {
  return status === "pending_customer";
}

async function request<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/support/tickets${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Erreur inattendue (${response.status}).`;
    try {
      const body = (await response.json()) as { message?: string; errors?: Record<string, string[]> };
      message = (body.errors ? Object.values(body.errors)[0]?.[0] : undefined) ?? body.message ?? message;
    } catch {
      // keep the generic message
    }
    throw new SupportError(message);
  }

  return (await response.json()) as T;
}

export const listTickets = (token: string) => request<{ data: Ticket[] }>(token, "").then((body) => body.data);

export const getTicket = (token: string, id: number) => request<Ticket>(token, `/${id}`);

export const openTicket = (
  token: string,
  input: { subject: string; category: TicketCategory; message: string; order_number?: string },
) => request<Ticket>(token, "", { method: "POST", body: JSON.stringify(input) });

export const replyToTicket = (token: string, id: number, body: string) =>
  request<Ticket>(token, `/${id}/messages`, { method: "POST", body: JSON.stringify({ body }) });
