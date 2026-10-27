"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { formatMoneyParts } from "@/lib/money";
import { CouponError, quoteCoupon, totalAfterDiscount, type CouponQuote } from "@/lib/coupons";
import { CheckoutError, placeOrder, rememberLastOrder } from "@/lib/orders";

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { items, subtotalAmount, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [couponInput, setCouponInput] = useState("");
  const [quote, setQuote] = useState<CouponQuote | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-3 px-4 py-16">
        <h1 className="font-display text-2xl font-semibold text-ink">Votre panier est vide</h1>
        <p className="text-ink-soft">Ajoutez des produits avant de passer commande.</p>
        <Link href="/" className="text-sm text-gold underline-offset-4 hover:underline">
          Voir le catalogue
        </Link>
      </main>
    );
  }

  const currency = items[0]?.currency ?? "XOF";
  const subtotal = formatMoneyParts({ amount: subtotalAmount, currency });
  const discount = quote ? formatMoneyParts({ amount: quote.discount_amount, currency }) : null;
  const total = formatMoneyParts({ amount: totalAfterDiscount(subtotalAmount, quote?.discount_amount ?? 0), currency });

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError(null);

    // The phone, when already typed, enables per-customer limits in the preview.
    const phone = formRef.current ? String(new FormData(formRef.current).get("customer_phone") ?? "") : "";

    try {
      setQuote(await quoteCoupon(couponInput, subtotalAmount, phone));
    } catch (caught) {
      setQuote(null);
      setCouponError(caught instanceof CouponError ? caught.message : "Code indisponible, réessayez.");
    } finally {
      setCheckingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setQuote(null);
    setCouponInput("");
    setCouponError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);

    try {
      const order = await placeOrder(
        {
          items: items.map((item) => ({ offer_id: item.offerId, quantity: item.quantity })),
          customer_name: String(form.get("customer_name") ?? ""),
          customer_phone: String(form.get("customer_phone") ?? ""),
          delivery_address: String(form.get("delivery_address") ?? ""),
          delivery_city: String(form.get("delivery_city") ?? "") || undefined,
          notes: String(form.get("notes") ?? "") || undefined,
          coupon_code: quote?.code,
        },
        token,
      );

      rememberLastOrder(order);
      clear();
      router.push(`/commande/${order.order_number}`);
    } catch (caught) {
      setError(caught instanceof CheckoutError ? caught.message : "La commande n'a pas pu être enregistrée.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-16">
      <h1 className="font-display text-2xl font-semibold text-ink">Finaliser la commande</h1>

      <ul className="flex flex-col divide-y divide-line border-y border-line text-sm">
        {items.map((item) => {
          const lineTotal = formatMoneyParts({ amount: item.priceAmount * item.quantity, currency: item.currency });
          return (
            <li key={item.offerId} className="flex items-center justify-between py-2">
              <span className="text-ink">
                {item.productName} <span className="text-ink-soft">× {item.quantity}</span>
              </span>
              <span className="text-ink">
                {lineTotal.amount} {lineTotal.label}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2 rounded-sm border border-line p-3">
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Code promotionnel
          <span className="flex gap-2">
            <input
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value)}
              disabled={quote !== null}
              placeholder="BIENVENUE10"
              className="flex-1 rounded-sm border border-line bg-surface px-3 py-2 uppercase text-ink focus:border-gold focus:outline-none disabled:opacity-60"
            />
            {quote ? (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="rounded-sm border border-line px-3 py-2 text-sm text-ink transition-colors hover:border-gold"
              >
                Retirer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={checkingCoupon || !couponInput.trim()}
                className="rounded-sm border border-gold px-3 py-2 text-sm text-gold transition-colors disabled:opacity-50"
              >
                Appliquer
              </button>
            )}
          </span>
        </label>
        {couponError ? <p className="text-sm text-danger">{couponError}</p> : null}
        {quote && discount ? (
          <p className="text-sm text-ink-soft">
            Code {quote.code} appliqué : −{discount.amount} {discount.label}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-end gap-1">
        <p className="text-sm text-ink-soft">
          Sous-total : {subtotal.amount} {subtotal.label}
        </p>
        <p className="font-display text-lg">
          Total : <span className="gold-text font-semibold">{total.amount}</span>{" "}
          <span className="text-ink-soft">{total.label}</span>
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Nom complet
          <input
            name="customer_name"
            required
            defaultValue={user?.name}
            className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Téléphone
          <input
            name="customer_phone"
            type="tel"
            required
            defaultValue={user?.phone ?? undefined}
            placeholder="07 00 00 00 00"
            className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Adresse de livraison (quartier, repères)
          <textarea
            name="delivery_address"
            required
            rows={2}
            placeholder="Ex : Cocody Angré, non loin de la pharmacie du carrefour"
            className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Ville
          <input
            name="delivery_city"
            placeholder="Abidjan"
            className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Notes (optionnel)
          <textarea
            name="notes"
            rows={2}
            className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>

        <p className="text-sm text-ink-soft">Paiement à la livraison.</p>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm bg-gold px-4 py-3 text-sm font-medium text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Envoi…" : "Confirmer la commande"}
        </button>
      </form>
    </main>
  );
}
