"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatMoneyParts } from "@/lib/money";
import { CheckoutError, placeOrder, rememberLastOrder } from "@/lib/orders";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalAmount, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);

    try {
      const order = await placeOrder({
        items: items.map((item) => ({ offer_id: item.offerId, quantity: item.quantity })),
        customer_name: String(form.get("customer_name") ?? ""),
        customer_phone: String(form.get("customer_phone") ?? ""),
        delivery_address: String(form.get("delivery_address") ?? ""),
        delivery_city: String(form.get("delivery_city") ?? "") || undefined,
        notes: String(form.get("notes") ?? "") || undefined,
      });

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

      <p className="self-end font-display text-lg">
        Sous-total : <span className="gold-text font-semibold">{subtotal.amount}</span>{" "}
        <span className="text-ink-soft">{subtotal.label}</span>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Nom complet
          <input
            name="customer_name"
            required
            className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Téléphone
          <input
            name="customer_phone"
            type="tel"
            required
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
