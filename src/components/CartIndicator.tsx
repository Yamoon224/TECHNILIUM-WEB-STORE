"use client";

import { Tr } from "@/components/Tr";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartIndicator() {
  const { count } = useCart();

  return (
    <Link
      href="/panier"
      className="flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg"
    >
      <span className="relative">
        <ShoppingCart className="h-6 w-6" aria-hidden />
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
            {count}
          </span>
        ) : null}
      </span>
      <span className="hidden sm:inline"><Tr>Panier</Tr></span>
    </Link>
  );
}
