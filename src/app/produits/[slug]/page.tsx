import { Suspense } from "react";
import { ProductDetail } from "@/components/ProductDetail";
import { Tr } from "@/components/Tr";

export default function ProductPage({ params }: PageProps<"/produits/[slug]">) {
  return (
    <Suspense
      fallback={<p className="mx-auto w-full max-w-5xl px-4 py-12 text-ink-soft"><Tr>Chargement du produit…</Tr></p>}
    >
      <ProductDetail params={params} />
    </Suspense>
  );
}
