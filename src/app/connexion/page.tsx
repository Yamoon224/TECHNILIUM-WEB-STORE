"use client";

import { LogoMark } from "@/components/LogoMark";
import { PasswordInput } from "@/components/PasswordInput";
import { Tr } from "@/components/Tr";
import { useAppearance } from "@/components/AppearanceProvider";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { AuthError } from "@/lib/auth";

type Mode = "login" | "register";

export default function ConnexionPage() {
  const { tr, appearance } = useAppearance();
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
        await register(String(form.get("name") ?? ""), email, password, appearance.language);
      }
      router.push("/compte");
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : tr("Une erreur est survenue. Réessayez."));
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
        {mode === "login" ? <Tr>Connexion</Tr> : <Tr>Créer un compte</Tr>}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" ? (
          <label className="field">
            <input
              placeholder={tr("Ex. Awa Diallo")}
              name="name"
              required
              className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
            />
            <span className="field-label">
              <Tr>Nom complet</Tr>
            </span>
          </label>
        ) : null}

        <label className="field">
          <input
            placeholder="vous@exemple.com"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
          <span className="field-label">
            <Tr>Adresse e-mail</Tr>
          </span>
        </label>

        <PasswordInput
          name="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          label={<Tr>Mot de passe</Tr>}
        />
        {mode === "login" ? (
          <Link href="/mot-de-passe-oublie" className="-mt-2 self-end text-xs text-gold-bright underline-offset-4 hover:underline">
            <Tr>Mot de passe oublié ?</Tr>
          </Link>
        ) : null}
        {mode === "register" ? (
          <p className="-mt-2 text-xs text-ink-soft">
            <Tr>8 caractères minimum, avec au moins une lettre et un chiffre.</Tr>
          </p>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm bg-gold px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Tr>Un instant…</Tr> : mode === "login" ? <Tr>Se connecter</Tr> : <Tr>Créer mon compte</Tr>}
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
        {mode === "login" ? <Tr>Pas encore de compte ? En créer un</Tr> : <Tr>Déjà un compte ? Se connecter</Tr>}
      </button>

      <Link href="/" className="text-sm text-ink-soft hover:text-gold">
        <Tr>← Retour au catalogue</Tr>
      </Link>
    </main>
  );
}
