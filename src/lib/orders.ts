import type { CurrencyCode } from "./money";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface OrderItem {
  offer_id: number;
  product_name: string;
  brand: string;
  quantity: number;
  unit_price: { amount: number; currency: CurrencyCode };
  line_total: { amount: number; currency: CurrencyCode };
}

export interface Order {
  order_number: string;
  status: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string | null;
  notes: string | null;
  subtotal: { amount: number; currency: CurrencyCode };
  items: OrderItem[];
  created_at: string | null;
}

export interface PlaceOrderInput {
  items: { offer_id: number; quantity: number }[];
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city?: string;
  notes?: string;
}

export class CheckoutError extends Error {}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new CheckoutError(body?.message ?? "La commande n'a pas pu être enregistrée.");
  }

  return response.json() as Promise<Order>;
}

/**
 * The order number alone isn't a secret — the API requires the phone used at
 * checkout as proof of ownership, returning 404 (not 403) on a mismatch so a
 * guessed order number can't be confirmed to exist.
 */
export async function getOrder(orderNumber: string, phone: string): Promise<Order | null> {
  const params = new URLSearchParams({ phone });
  const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderNumber)}?${params}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`/orders/${orderNumber} responded with ${response.status}`);
  }

  return response.json() as Promise<Order>;
}
