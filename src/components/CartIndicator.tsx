"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartIndicator() {
  const { count } = useCart();

  return (
    <Link
      href="/panier"
      className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg"
    >
      <span className="relative">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M3 4h2l2.4 11h10.2L20 7H6.2" />
          <circle cx="9" cy="19" r="1.4" />
          <circle cx="17" cy="19" r="1.4" />
        </svg>
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
            {count}
          </span>
        ) : null}
      </span>
      <span className="hidden sm:inline">Panier</span>
    </Link>
  );
}
