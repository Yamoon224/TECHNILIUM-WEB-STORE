"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { CurrencyCode } from "@/lib/money";

export interface AddToCartButtonProps {
  offerId: number;
  productSlug: string;
  productName: string;
  brand: string;
  priceAmount: number;
  currency: CurrencyCode;
  stockQuantity: number;
}

export function AddToCartButton({
  offerId,
  productSlug,
  productName,
  brand,
  priceAmount,
  currency,
  stockQuantity,
}: AddToCartButtonProps) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);

  const alreadyInCart = items.find((line) => line.offerId === offerId)?.quantity ?? 0;
  const outOfStock = stockQuantity <= 0;
  const atStockLimit = alreadyInCart >= stockQuantity;

  function handleClick() {
    add(
      { offerId, productSlug, productName, brand, priceAmount, currency, maxQuantity: stockQuantity },
      1,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  if (outOfStock) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-sm border border-line bg-surface px-4 py-3 text-sm text-ink-soft"
      >
        Rupture de stock
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={atStockLimit}
      className="w-full rounded-sm bg-gold px-4 py-3 text-sm font-medium text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
    >
      {atStockLimit ? "Stock maximum dans le panier" : added ? "Ajouté ✓" : "Ajouter au panier"}
    </button>
  );
}
