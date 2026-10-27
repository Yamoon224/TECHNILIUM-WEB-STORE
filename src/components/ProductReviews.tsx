"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  ReviewsError,
  countLabel,
  formatAverage,
  getEligibility,
  getProductReviews,
  ineligibleMessage,
  sharePercent,
  stars,
  submitReview,
  type Eligibility,
  type ProductReviews as Data,
} from "@/lib/reviews";

/**
 * Rating summary, published reviews, and — for a signed-in customer who
 * received the product — the form to add one. The server enforces the
 * purchase check; this only decides whether to show the form.
 */
export function ProductReviews({ productId }: { productId: number }) {
  const { token, status } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    getProductReviews(productId)
      .then(setData)
      .catch((caught) => setError(caught instanceof ReviewsError ? caught.message : "Avis indisponibles."));
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token) return;
    getEligibility(token, productId)
      .then(setEligibility)
      .catch(() => setEligibility(null));
  }, [token, productId]);

  return (
    <section className="flex flex-col gap-5 border-t border-line pt-8" aria-label="Avis clients">
      <h2 className="font-display text-xl font-semibold text-ink">Avis clients</h2>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {data ? (
        <>
          <Summary summary={data.summary} />

          {data.reviews.length > 0 ? (
            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {data.reviews.map((review) => (
                <li key={review.id} className="flex flex-col gap-1 py-4 text-sm">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-gold-bright" aria-label={`${review.rating} sur 5`}>
                      {stars(review.rating)}
                    </span>
                    {review.title ? <span className="font-medium text-ink">{review.title}</span> : null}
                  </p>
                  {review.body ? <p className="whitespace-pre-wrap text-ink-soft">{review.body}</p> : null}
                  <p className="text-xs text-ink-soft">
                    {review.author_name}
                    {review.verified_purchase ? " · Achat vérifié" : ""}
                    {review.published_at ? ` · ${review.published_at.slice(0, 10)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : error ? null : (
        <p className="text-sm text-ink-soft">Chargement…</p>
      )}

      {notice ? <p className="text-sm text-gold">{notice}</p> : null}

      {status === "checking" ? null : !token ? (
        <p className="text-sm text-ink-soft">
          <Link href="/connexion" className="text-gold underline-offset-4 hover:underline">
            Connectez-vous
          </Link>{" "}
          pour donner votre avis si vous avez reçu ce produit.
        </p>
      ) : eligibility === null ? null : eligibility.can_review ? (
        <ReviewForm
          onSubmit={async (input) => {
            const result = await submitReview(token, { product_id: productId, ...input });
            setEligibility({ can_review: false, reason: "already_reviewed" });
            setNotice(
              result.status === "pending"
                ? "Merci ! Votre avis sera publié après vérification par notre équipe."
                : "Merci ! Votre avis est publié.",
            );
            load();
          }}
        />
      ) : (
        <p className="text-sm text-ink-soft">{ineligibleMessage(eligibility)}</p>
      )}
    </section>
  );
}

function Summary({ summary }: { summary: Data["summary"] }) {
  if (summary.count === 0) {
    return <p className="text-sm text-ink-soft">Aucun avis pour l&apos;instant.</p>;
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      <p className="flex flex-col">
        <span className="font-display text-4xl font-semibold text-ink">{formatAverage(summary.average)}</span>
        <span className="text-gold-bright" aria-hidden="true">
          {stars(summary.average)}
        </span>
        <span className="text-xs text-ink-soft">{countLabel(summary.count)}</span>
      </p>

      <ul className="flex flex-1 flex-col gap-1 text-xs text-ink-soft" aria-label="Répartition des notes">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.distribution[star] ?? 0;
          return (
            <li key={star} className="flex items-center gap-2">
              <span className="w-6">{star} ★</span>
              <span className="h-1.5 flex-1 rounded-[4px] bg-surface-raised">
                <span className="block h-full rounded-[4px] bg-gold" style={{ width: `${sharePercent(count, summary.count)}%` }} />
              </span>
              <span className="w-6 text-right">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReviewForm({ onSubmit }: { onSubmit: (input: { rating: number; title?: string; body?: string }) => Promise<void> }) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1) {
      setError("Choisissez une note de 1 à 5.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        rating,
        title: String(form.get("title") ?? "") || undefined,
        body: String(form.get("body") ?? "") || undefined,
      });
    } catch (caught) {
      setError(caught instanceof ReviewsError ? caught.message : "Votre avis n'a pas pu être envoyé.");
      setSubmitting(false);
    }
  }

  const field = "rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h3 className="font-display text-lg font-semibold text-ink">Donner votre avis</h3>

      <fieldset className="flex items-center gap-1" aria-label="Note">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`${value} sur 5`}
            aria-pressed={rating === value}
            className={`text-2xl leading-none ${value <= rating ? "text-gold-bright" : "text-ink-soft"}`}
          >
            {value <= rating ? "★" : "☆"}
          </button>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        Titre (optionnel)
        <input name="title" maxLength={120} className={field} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        Votre avis (optionnel)
        <textarea name="body" rows={3} maxLength={2000} className={field} />
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-sm bg-gold px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-gold-bright disabled:opacity-60"
      >
        {submitting ? "Envoi…" : "Publier mon avis"}
      </button>
    </form>
  );
}
