import { notFound } from "next/navigation";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductTile } from "@/components/ProductTile";
import { formatMoneyParts } from "@/lib/money";
import { getProduct } from "@/lib/catalog";

const CONDITION_LABEL: Record<string, string> = {
  neuf: "Neuf",
  reconditionne: "Reconditionné",
  occasion: "Occasion",
};

const ATTRIBUTE_LABEL: Record<string, string> = {
  ram_gb: "Mémoire vive",
  storage_gb: "Stockage",
  color: "Couleur",
};

/** Resolves `params` and the product inside the page's Suspense boundary (see HomeCatalog). */
export async function ProductDetail({ params }: Pick<PageProps<"/produits/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const offer = product.best_offer;
  const price = offer ? formatMoneyParts(offer.price) : null;
  const compareAt = offer?.compare_at_price ? formatMoneyParts(offer.compare_at_price) : null;

  const specs = Object.entries(product.attributes ?? {});
  const variantAttributes = product.variants[0]?.attributes
    ? Object.entries(product.variants[0].attributes)
    : [];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-6 pb-16">
      <Link href="/" className="text-sm text-ink-soft hover:text-gold">
        ← Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="md:max-w-md">
          <ProductTile id={product.id} brand={product.brand} categoryName={product.category?.name ?? null} />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-ink-soft">{product.brand}</p>
            <h1 className="font-display text-2xl font-semibold text-ink">{product.name}</h1>
          </div>

          {price ? (
            <div className="flex items-baseline gap-3">
              <p className="font-display leading-none">
                <span className="gold-text text-4xl font-semibold">{price.amount}</span>{" "}
                <span className="text-base text-ink-soft">{price.label}</span>
              </p>
              {compareAt ? (
                <p className="text-sm text-ink-soft line-through">
                  {compareAt.amount} {compareAt.label}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-ink-soft">Bientôt disponible</p>
          )}

          <p className="text-sm text-ink-soft">
            {CONDITION_LABEL[product.condition_state]}
            {offer && offer.warranty_months > 0 ? `, garanti ${offer.warranty_months} mois` : ""}
          </p>

          {offer ? (
            <p className="text-sm text-gold">
              {offer.seller === "vendor"
                ? "Vendu par un vendeur vérifié Technilium"
                : "Vendu et expédié par Technilium"}
            </p>
          ) : null}

          {offer ? (
            <AddToCartButton
              offerId={offer.id}
              productSlug={product.slug}
              productName={product.name}
              brand={product.brand}
              priceAmount={offer.price.amount}
              currency={offer.price.currency}
              stockQuantity={offer.stock_quantity}
            />
          ) : null}

          {product.description ? (
            <p className="max-w-prose text-sm leading-relaxed text-ink-soft">{product.description}</p>
          ) : null}

          {specs.length > 0 || variantAttributes.length > 0 ? (
            <dl className="flex flex-col divide-y divide-line border-y border-line text-sm">
              {[...specs, ...variantAttributes].map(([key, value]) => (
                <div key={key} className="flex justify-between py-2">
                  <dt className="text-ink-soft">{ATTRIBUTE_LABEL[key] ?? key}</dt>
                  <dd className="text-ink">{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </main>
  );
}
