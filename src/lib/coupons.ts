/**
 * Cart preview of a promotional code (backend Promotions module). The server
 * stays the authority: the code is validated again, atomically, when the
 * order is placed.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class CouponError extends Error {}

export interface CouponQuote {
  code: string;
  discount_amount: number;
  total_after_discount: number;
}

/** What the customer will owe once a discount is taken off; never negative. */
export function totalAfterDiscount(subtotal: number, discount: number): number {
  return Math.max(0, subtotal - Math.max(0, discount));
}

export async function quoteCoupon(code: string, subtotal: number, customerPhone?: string): Promise<CouponQuote> {
  const response = await fetch(`${API_BASE_URL}/coupons/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ code, subtotal, customer_phone: customerPhone || undefined }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new CouponError(body?.message ?? "Ce code promotionnel n'est pas valable.");
  }

  return response.json() as Promise<CouponQuote>;
}
