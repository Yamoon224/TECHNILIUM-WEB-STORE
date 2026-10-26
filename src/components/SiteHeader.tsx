import Link from "next/link";
import { AccountIndicator } from "./AccountIndicator";
import { CartIndicator } from "./CartIndicator";
import { LogoMark } from "./LogoMark";

export function SiteHeader({ defaultSearch }: { defaultSearch?: string }) {
  return (
    <header className="flex flex-col gap-4 pt-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" aria-label="Technilium, accueil">
        <LogoMark />
      </Link>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <form action="/" method="get" className="flex w-full max-w-sm items-center gap-2">
          <input
            type="search"
            name="search"
            defaultValue={defaultSearch}
            placeholder="Rechercher un smartphone, un ordinateur…"
            className="w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-sm border border-line px-3 py-2 text-sm text-ink transition-colors hover:border-gold"
          >
            Chercher
          </button>
        </form>

        <AccountIndicator />
        <CartIndicator />
      </div>
    </header>
  );
}
