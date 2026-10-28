import type { Offer } from "./catalog";

/**
 * Whole-number percentage off the "compare at" price, or null when the offer
 * has no real reduction (no reference price, other currency, or not cheaper).
 */
export function discountPercent(offer: Pick<Offer, "price" | "compare_at_price">): number | null {
  const reference = offer.compare_at_price;
  if (!reference || reference.currency !== offer.price.currency) return null;
  if (reference.amount <= 0 || offer.price.amount >= reference.amount) return null;

  const percent = Math.round(((reference.amount - offer.price.amount) / reference.amount) * 100);
  return percent >= 1 ? percent : null;
}
