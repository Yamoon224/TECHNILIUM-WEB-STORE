import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-3 px-4 py-16">
      <h1 className="font-display text-2xl font-semibold text-ink">Produit introuvable</h1>
      <p className="text-ink-soft">Ce produit n&apos;existe pas ou n&apos;est plus disponible.</p>
      <Link href="/" className="text-sm text-gold underline-offset-4 hover:underline">
        Retour au catalogue
      </Link>
    </main>
  );
}
