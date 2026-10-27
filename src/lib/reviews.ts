/**
 * Product reviews (backend Customers module, `/reviews`). Reading is public;
 * writing needs a verified purchase, which the server decides — the
 * eligibility call only tells the form whether to show.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface Review {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  author_name: string;
  verified_purchase: boolean;
  published_at: string | null;
}

export interface ReviewSummary {
  count: number;
  average: number;
  /** Stars (1-5) => number of reviews. */
  distribution: Record<number, number>;
}

export interface ProductReviews {
  summary: ReviewSummary;
  reviews: Review[];
}

export type IneligibleReason = "not_purchased" | "already_reviewed" | "unavailable";

export interface Eligibility {
  can_review: boolean;
  reason: IneligibleReason | null;
}

export const INELIGIBLE_MESSAGE: Record<IneligibleReason, string> = {
  not_purchased: "Seuls les clients ayant reçu ce produit peuvent donner un avis.",
  already_reviewed: "Vous avez déjà donné votre avis sur ce produit. Merci !",
  unavailable: "Ce produit n'accepte pas d'avis pour le moment.",
};

export class ReviewsError extends Error {}

/** "4,3" — a French decimal comma, one decimal. */
export function formatAverage(average: number): string {
  return average.toFixed(1).replace(".", ",");
}

/** "★★★★☆" for a whole rating 1-5 (clamped). */
export function stars(rating: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

/** Share of reviews at a given star count, as a whole percentage; 0 when there are none. */
export function sharePercent(count: number, total: number): number {
  return total > 0 ? Math.round((count * 100) / total) : 0;
}

/** "1 avis" / "12 avis" / "Aucun avis". */
export function countLabel(count: number): string {
  if (count === 0) return "Aucun avis";
  return `${count} avis`;
}

/** Why the form is hidden, for a signed-in customer; null when they may review. */
export function ineligibleMessage(eligibility: Eligibility): string | null {
  return eligibility.can_review || eligibility.reason === null ? null : INELIGIBLE_MESSAGE[eligibility.reason];
}

async function parseError(response: Response): Promise<ReviewsError> {
  try {
    const body = (await response.json()) as { message?: string; errors?: Record<string, string[]> };
    const first = body.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return new ReviewsError(first ?? body.message ?? `Erreur inattendue (${response.status}).`);
  } catch {
    return new ReviewsError(`Erreur inattendue (${response.status}).`);
  }
}

export async function getProductReviews(productId: number): Promise<ProductReviews> {
  const response = await fetch(`${API_BASE_URL}/reviews/products/${productId}`, { cache: "no-store" });
  if (!response.ok) throw await parseError(response);

  const body = (await response.json()) as { summary: ReviewSummary; reviews: { data: Review[] } };
  return { summary: body.summary, reviews: body.reviews.data };
}

export async function getEligibility(token: string, productId: number): Promise<Eligibility> {
  const response = await fetch(`${API_BASE_URL}/reviews/products/${productId}/eligibility`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<Eligibility>;
}

export async function submitReview(
  token: string,
  input: { product_id: number; rating: number; title?: string; body?: string },
): Promise<{ status: "published" | "pending" }> {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await parseError(response);
  return response.json() as Promise<{ status: "published" | "pending" }>;
}
