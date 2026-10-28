"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { AuthError } from "@/lib/auth";

type Mode = "login" | "register";

export default function ConnexionPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(String(form.get("name") ?? ""), email, password);
      }
      router.push("/compte");
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="font-display text-xl font-semibold text-ink">
        {mode === "login" ? "Connexion" : "Créer un compte"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" ? (
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Nom complet
            <input
              name="name"
              required
              className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Adresse e-mail
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Mot de passe
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
          {mode === "register" ? (
            <span className="text-xs text-ink-soft">8 caractères minimum, avec au moins une lettre et un chiffre.</span>
          ) : null}
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm bg-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
        className="text-sm text-ink-soft underline-offset-4 hover:text-gold hover:underline"
      >
        {mode === "login" ? "Pas encore de compte ? En créer un" : "Déjà un compte ? Se connecter"}
      </button>

      <Link href="/" className="text-sm text-ink-soft hover:text-gold">
        ← Retour au catalogue
      </Link>
    </main>
  );
}
