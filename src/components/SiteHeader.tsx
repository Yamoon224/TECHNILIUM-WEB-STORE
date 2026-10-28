import Link from "next/link";
import { Suspense } from "react";
import { AccountIndicator } from "./AccountIndicator";
import { CartIndicator } from "./CartIndicator";
import { LogoMark } from "./LogoMark";
import { SearchBox } from "./SearchBox";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 bg-surface shadow-sm">
      <div className="bg-ink text-xs text-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-1.5">
          <p>Paiement à la livraison · Produits vérifiés · Garantie sur chaque appareil</p>
          <Link href="/aide" className="hidden underline-offset-4 hover:underline sm:inline">
            Besoin d&apos;aide ?
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" aria-label="Technilium, accueil" className="shrink-0">
          <LogoMark />
        </Link>

        <div className="order-3 flex w-full sm:order-none sm:w-auto sm:flex-1">
          <Suspense fallback={<div className="h-10 w-full rounded-sm border border-line" />}>
            <SearchBox />
          </Suspense>
        </div>

        <nav className="ml-auto flex items-center gap-1" aria-label="Compte et panier">
          <AccountIndicator />
          <Link
            href="/aide"
            className="hidden rounded-sm px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-bg md:block"
          >
            Aide
          </Link>
          <CartIndicator />
        </nav>
      </div>
    </header>
  );
}
