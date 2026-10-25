"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartIndicator() {
  const { count } = useCart();

  return (
    <Link
      href="/panier"
      className="flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-sm text-ink transition-colors hover:border-gold"
    >
      Panier
      <span className="gold-text font-display font-semibold">{count}</span>
    </Link>
  );
}
