import Link from "next/link";
import { formatMoneyParts } from "@/lib/money";
import type { Product } from "@/lib/catalog";
import { ProductTile } from "./ProductTile";

const CONDITION_LABEL: Record<Product["condition_state"], string> = {
  neuf: "Neuf",
  reconditionne: "Reconditionné",
  occasion: "Occasion",
};

export function ProductCard({ product }: { product: Product }) {
  const offer = product.best_offer;
  const price = offer ? formatMoneyParts(offer.price) : null;

  const conditionLine = [
    CONDITION_LABEL[product.condition_state],
    offer && offer.warranty_months > 0 ? `garanti ${offer.warranty_months} mois` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group flex flex-col gap-3 rounded-sm border border-line bg-surface p-3 transition-colors hover:border-gold"
    >
      <ProductTile id={product.id} brand={product.brand} categoryName={product.category?.name ?? null} />

      <div className="flex flex-col gap-1">
        <p className="text-sm text-ink-soft">{product.brand}</p>
        <h3 className="text-base font-medium leading-snug text-ink">{product.name}</h3>
      </div>

      {price ? (
        <p className="font-display leading-none">
          <span className="gold-text text-2xl font-semibold">{price.amount}</span>{" "}
          <span className="text-sm text-ink-soft">{price.label}</span>
        </p>
      ) : (
        <p className="text-sm text-ink-soft">Bientôt disponible</p>
      )}

      <p className="text-sm text-ink-soft">{conditionLine}</p>

      {offer && offer.seller === "vendor" ? (
        <p className="text-xs text-gold">Vendu par un vendeur vérifié Technilium</p>
      ) : null}
    </Link>
  );
}
