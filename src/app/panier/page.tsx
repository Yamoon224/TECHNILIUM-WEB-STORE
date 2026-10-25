"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { ProductTile } from "@/components/ProductTile";
import { formatMoneyParts } from "@/lib/money";

export default function CartPage() {
  const { items, updateQuantity, remove, subtotalAmount } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-3 px-4 py-16">
        <h1 className="font-display text-2xl font-semibold text-ink">Votre panier est vide</h1>
        <p className="text-ink-soft">Parcourez le catalogue pour y ajouter des produits.</p>
        <Link href="/" className="text-sm text-gold underline-offset-4 hover:underline">
          Voir le catalogue
        </Link>
      </main>
    );
  }

  const currency = items[0]?.currency ?? "XOF";
  const subtotal = formatMoneyParts({ amount: subtotalAmount, currency });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-16">
      <h1 className="font-display text-2xl font-semibold text-ink">Votre panier</h1>

      <ul className="flex flex-col divide-y divide-line border-y border-line">
        {items.map((item) => {
          const lineTotal = formatMoneyParts({ amount: item.priceAmount * item.quantity, currency: item.currency });

          return (
            <li key={item.offerId} className="flex items-center gap-4 py-4">
              <div className="w-16 shrink-0">
                <ProductTile id={item.offerId} brand={item.brand} categoryName={null} />
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <Link href={`/produits/${item.productSlug}`} className="text-sm font-medium text-ink hover:text-gold">
                  {item.productName}
                </Link>
                <p className="text-xs text-ink-soft">{item.brand}</p>

                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.offerId, item.quantity - 1)}
                    className="h-7 w-7 rounded-sm border border-line text-ink hover:border-gold"
                    aria-label="Diminuer la quantité"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm text-ink">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.offerId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxQuantity}
                    className="h-7 w-7 rounded-sm border border-line text-ink hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item.offerId)}
                    className="ml-2 text-xs text-ink-soft underline-offset-4 hover:text-gold hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              </div>

              <p className="font-display text-sm font-semibold text-ink">
                {lineTotal.amount} {lineTotal.label}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col items-end gap-4">
        <p className="font-display text-lg">
          Sous-total : <span className="gold-text font-semibold">{subtotal.amount}</span>{" "}
          <span className="text-ink-soft">{subtotal.label}</span>
        </p>

        <button
          type="button"
          disabled
          title="La commande en ligne arrive bientôt"
          className="w-full max-w-xs cursor-not-allowed rounded-sm border border-line bg-surface px-4 py-3 text-sm text-ink-soft"
        >
          Passer la commande — bientôt disponible
        </button>
      </div>
    </main>
  );
}
