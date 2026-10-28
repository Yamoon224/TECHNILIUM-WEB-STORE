import Link from "next/link";
import { Tr } from "@/components/Tr";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-3 px-4 py-16">
      <h1 className="font-display text-2xl font-semibold text-ink"><Tr>Produit introuvable</Tr></h1>
      <p className="text-ink-soft"><Tr>Ce produit n&apos;existe pas ou n&apos;est plus disponible.</Tr></p>
      <Link href="/" className="text-sm text-gold underline-offset-4 hover:underline">
        <Tr>Retour au catalogue</Tr>
      </Link>
    </main>
  );
}
