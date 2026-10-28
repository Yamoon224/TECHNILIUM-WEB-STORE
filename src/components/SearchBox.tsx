"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

/** Reads the current query client-side, so the header can live in the static layout shell. */
export function SearchBox() {
  const search = useSearchParams().get("search") ?? "";

  return (
    <form action="/" method="get" role="search" className="flex w-full min-w-0 flex-1 items-center">
      <input
        key={search}
        type="search"
        name="search"
        defaultValue={search}
        placeholder="Rechercher un produit, une marque ou une catégorie"
        aria-label="Rechercher"
        className="w-full min-w-0 rounded-l-sm border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-r-sm bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-bright"
      >
        <Search className="h-4 w-4 sm:hidden" aria-label="Rechercher" />
        <span className="hidden sm:inline">Rechercher</span>
      </button>
    </form>
  );
}
