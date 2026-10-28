import Link from "next/link";
import { formatMoneyParts } from "@/lib/money";
import { discountPercent } from "@/lib/pricing";
import type { Product } from "@/lib/catalog";
import { AddToCartButton } from "./AddToCartButton";
import { ProductTile } from "./ProductTile";

const CONDITION_LABEL: Record<Product["condition_state"], string> = {
  neuf: "Neuf",
  reconditionne: "Reconditionné",
  occasion: "Occasion",
};

/** Few units left: a nudge, shown only when it is true. */
const LOW_STOCK_THRESHOLD = 5;

export function ProductCard({ product }: { product: Product }) {
  const offer = product.best_offer;
  const price = offer ? formatMoneyParts(offer.price) : null;
  const reference = offer?.compare_at_price ? formatMoneyParts(offer.compare_at_price) : null;
  const percent = offer ? discountPercent(offer) : null;

  const conditionLine = [
    CONDITION_LABEL[product.condition_state],
    offer && offer.warranty_months > 0 ? `garanti ${offer.warranty_months} mois` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="group flex h-full flex-col gap-2 rounded-sm bg-surface p-2 shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/produits/${product.slug}`} className="relative flex flex-1 flex-col gap-2">
        <div className="relative">
          <ProductTile id={product.id} brand={product.brand} categoryName={product.category?.name ?? null} />
          {percent ? (
            <span className="absolute right-2 top-2 rounded-sm bg-gold-highlight px-1.5 py-0.5 text-xs font-semibold text-gold-bright">
              -{percent}%
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-sm leading-snug text-ink">
          {product.brand} {product.name}
        </h3>

        {price ? (
          <div className="flex flex-col">
            <span className="text-base font-semibold text-ink">
              {price.amount} {price.label}
            </span>
            {reference && percent ? (
              <span className="text-xs text-ink-soft line-through">
                {reference.amount} {reference.label}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-ink-soft">Bientôt disponible</p>
        )}

        {offer && !offer.in_stock ? (
          <p className="text-xs font-medium text-danger">Rupture de stock</p>
        ) : offer && offer.stock_quantity <= LOW_STOCK_THRESHOLD ? (
          <p className="text-xs font-medium text-gold-bright">{offer.stock_quantity} article{offer.stock_quantity > 1 ? "s" : ""} restant{offer.stock_quantity > 1 ? "s" : ""}</p>
        ) : null}

        <p className="text-xs text-ink-soft">{conditionLine}</p>

        {offer && offer.seller === "vendor" ? <p className="text-xs text-gold-bright">Vendeur vérifié</p> : null}
      </Link>

      {offer ? (
        <AddToCartButton
          offerId={offer.id}
          productSlug={product.slug}
          productName={product.name}
          brand={product.brand}
          priceAmount={offer.price.amount}
          currency={offer.price.currency}
          stockQuantity={offer.stock_quantity}
          compact
        />
      ) : null}
    </div>
  );
}
