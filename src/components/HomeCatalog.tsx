import Link from "next/link";
import { CategoryRail } from "@/components/CategoryRail";
import { ProductCard } from "@/components/ProductCard";
import { SiteHeader } from "@/components/SiteHeader";
import { TrustStrip } from "@/components/TrustStrip";
import { getCategories, getProducts, type Category, type Product } from "@/lib/catalog";

/**
 * Reads `searchParams` and the catalog inside the page's Suspense boundary:
 * doing it at the top of the page would block the static shell (Cache Components).
 */
export async function HomeCatalog({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;

  let categories: Category[] = [];
  let products: Product[] = [];
  let catalogUnavailable = false;

  try {
    [categories, products] = await Promise.all([
      getCategories(),
      getProducts({ category, search }),
    ]);
  } catch {
    catalogUnavailable = true;
  }

  const activeCategoryName = categories.find((c) => c.slug === category)?.name;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-16">
      <SiteHeader defaultSearch={search} />
      <TrustStrip />
      <CategoryRail categories={categories} activeSlug={category} />

      {catalogUnavailable ? (
        <p className="py-12 text-ink-soft">
          Le catalogue est momentanément indisponible. Réessayez dans un instant.
        </p>
      ) : products.length === 0 ? (
        <EmptyState search={search} categoryName={activeCategoryName} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState({ search, categoryName }: { search?: string; categoryName?: string }) {
  const message = search
    ? `Aucun produit ne correspond à « ${search} ».`
    : categoryName
      ? `Aucun produit disponible dans ${categoryName} pour le moment.`
      : "Le catalogue est vide pour le moment.";

  return (
    <div className="flex flex-col items-start gap-2 py-12">
      <p className="text-ink-soft">{message}</p>
      {search || categoryName ? (
        <Link href="/" className="text-sm text-gold underline-offset-4 hover:underline">
          Voir tous les produits
        </Link>
      ) : null}
    </div>
  );
}
