"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "@/lib/auth";
import { useAppearance } from "./AppearanceProvider";
import { LogoMark } from "./LogoMark";
import { Tr } from "./Tr";

/** Step 1: the address. The answer never says whether an account exists. */
export function ForgotPasswordForm() {
  const { tr } = useAppearance();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch {
      setError(tr("L'envoi n'a pas pu être fait. Vérifiez l'adresse et réessayez."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto my-8 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-6 rounded-sm bg-surface p-5 shadow-card border-b-4 border-b-gold sm:p-8">
      <div className="flex justify-center">
        <LogoMark />
      </div>

      <h1 className="text-center font-display text-xl font-semibold text-ink">
        <Tr>Mot de passe oublié</Tr>
      </h1>

      {sent ? (
        <div className="flex flex-col gap-3 text-sm text-ink-soft" role="status">
          <p className="flex items-start gap-2 text-ink">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
            <Tr>Si un compte correspond à cette adresse, un e-mail de réinitialisation vient d&apos;être envoyé. Le lien est valable une heure.</Tr>
          </p>
          <p>
            <Tr>Pensez à regarder dans vos courriers indésirables.</Tr>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">
            <Tr>Saisissez l&apos;adresse e-mail de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe.</Tr>
          </p>

          <label className="field">
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={tr("vous@exemple.com")}
              className="text-ink"
            />
            <span className="field-label">
              <Tr>Adresse e-mail</Tr>
            </span>
          </label>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-sm bg-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Tr>Un instant…</Tr> : <Tr>Envoyer le lien</Tr>}
          </button>
        </form>
      )}

      <Link href="/connexion" className="text-center text-sm text-gold-bright underline-offset-4 hover:underline">
        <Tr>Retour à la connexion</Tr>
      </Link>
    </main>
  );
}
