"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { normalizeOrderNumber } from "@/lib/orders";
import { Tr } from "./Tr";
import { useAppearance } from "./AppearanceProvider";

/**
 * Tracking without an account: the order number (given at checkout) takes the
 * visitor to their order, where the phone used for the order is asked for.
 */
export function GuestTracking() {
  const { tr } = useAppearance();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const number = normalizeOrderNumber(String(new FormData(event.currentTarget).get("order_number") ?? ""));
    if (!number) {
      setError(tr("Saisissez le numéro de votre commande."));
      return;
    }

    router.push(`/commande/${encodeURIComponent(number)}`);
  }

  return (
    <main className="mx-auto my-8 flex w-[calc(100%-2rem)] max-w-md flex-col gap-4 rounded-sm bg-surface p-5 shadow-card border-b-4 border-b-gold sm:p-8">
      <h1 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
        <Search className="h-5 w-5 text-gold" aria-hidden /> <Tr>Suivre ma commande</Tr>
      </h1>
      <p className="text-sm text-ink-soft">
        <Tr>
          Pas de compte nécessaire : entrez le numéro de votre commande, puis le téléphone utilisé pour la passer.
        </Tr>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="field">
          <input
            name="order_number"
            required
            autoComplete="off"
            placeholder="TCH-20261025-XXXXXX"
            className="rounded-sm border border-line bg-surface px-3 py-2 uppercase text-ink focus:border-gold focus:outline-none"
          />
          <span className="field-label">
            <Tr>Numéro de commande</Tr>
          </span>
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          className="rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold-bright"
        >
          <Tr>Continuer</Tr>
        </button>
      </form>
    </main>
  );
}
