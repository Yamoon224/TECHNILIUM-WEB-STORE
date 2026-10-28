"use client";

import { Tr } from "@/components/Tr";
import { useAppearance } from "@/components/AppearanceProvider";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

/** Reads the current query client-side, so the header can live in the static layout shell. */
export function SearchBox() {
  const { tr } = useAppearance();
  const search = useSearchParams().get("search") ?? "";

  return (
    <form action="/" method="get" role="search" className="flex w-full min-w-0 flex-1 items-center">
      <label className="field min-w-0 flex-1">
        <input
          key={search}
          type="search"
          name="search"
          defaultValue={search}
          placeholder={tr("Rechercher un produit, une marque ou une catégorie")}
          className="w-full min-w-0 rounded-l-sm border border-line bg-surface px-4 text-sm text-ink focus:border-gold focus:outline-none"
        />
        <span className="field-label">
          <Tr>Rechercher un produit, une marque ou une catégorie</Tr>
        </span>
      </label>
      <button
        type="submit"
        className="shrink-0 rounded-r-sm bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-bright"
      >
        <Search className="h-4 w-4 sm:hidden" aria-label={tr("Rechercher")} />
        <span className="hidden sm:inline">
          <Tr>Rechercher</Tr>
        </span>
      </button>
    </form>
  );
}
