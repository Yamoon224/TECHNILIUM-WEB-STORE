"use client";

import { ArrowLeft, Home, LogIn, RotateCw } from "lucide-react";
import Link from "next/link";
import { errorInfo, type ErrorInfo } from "@/lib/errors";
import { Tr } from "./Tr";

/**
 * The page shown for an HTTP error: the code in large letters, what it means, and the ways out.
 * Pass `code` for a known code, or `info` for a custom text; `retry` adds a "Réessayer" button.
 */
export function ErrorScreen({
  code,
  info,
  retry,
  reference,
}: {
  code?: number;
  info?: ErrorInfo;
  retry?: () => void;
  /** An error identifier to quote to the support (the digest of a server error). */
  reference?: string;
}) {
  const page = info ?? (code !== undefined ? errorInfo(code) : null) ?? errorInfo(500);
  if (!page) return null;

  const action = "inline-flex items-center gap-2 rounded-sm px-4 py-2 text-sm transition-colors";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center" data-error-code={page.code}>
      <p aria-label={`${page.code}`} className="font-display text-7xl font-bold tracking-wide text-gold sm:text-8xl">
        {page.code}
      </p>
      <h1 className="page-title font-display text-2xl font-semibold text-ink">
        <Tr>{page.title}</Tr>
      </h1>
      <p className="max-w-md text-ink-soft">
        <Tr>{page.message}</Tr>
      </p>
      {reference ? (
        <p className="text-xs text-ink-soft">
          <Tr>Référence de l&apos;erreur :</Tr> <code>{reference}</code>
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {retry ? (
          <button type="button" onClick={retry} className={`${action} bg-gold font-medium text-on-primary hover:bg-gold-bright`}>
            <RotateCw className="h-4 w-4" aria-hidden /> <Tr>Réessayer</Tr>
          </button>
        ) : null}
        {page.signIn ? (
          <Link href="/connexion" className={`${action} bg-gold font-medium text-on-primary hover:bg-gold-bright`}>
            <LogIn className="h-4 w-4" aria-hidden /> <Tr>Se connecter</Tr>
          </Link>
        ) : null}
        <Link href="/" className={`${action} border border-line text-ink hover:border-gold`}>
          <Home className="h-4 w-4" aria-hidden /> <Tr>Retour à l&apos;accueil</Tr>
        </Link>
        <button type="button" onClick={() => window.history.back()} className={`${action} text-ink-soft hover:text-ink`}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> <Tr>Page précédente</Tr>
        </button>
      </div>
    </main>
  );
}
