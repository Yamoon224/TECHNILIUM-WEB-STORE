const TILE_VARIANTS = ["product-tile-a", "product-tile-b", "product-tile-c"] as const;

export interface ProductTileProps {
  id: number;
  brand: string;
  categoryName: string | null;
}

/**
 * Stands in for a product photo until real catalogue images exist. Deliberately
 * not a grey box or broken-image glyph: a brand-initial plate in the brand's
 * own gold, deterministic per product so the same item always matches.
 */
export function ProductTile({ id, brand, categoryName }: ProductTileProps) {
  const variant = TILE_VARIANTS[id % TILE_VARIANTS.length];

  return (
    <div
      className={`${variant} relative flex aspect-square w-full items-end justify-between overflow-hidden rounded-sm border border-line p-3`}
    >
      <span className="gold-text font-display text-6xl font-semibold leading-none opacity-70" aria-hidden>
        {brand.charAt(0)}
      </span>
      {categoryName ? <span className="text-xs text-ink-soft">{categoryName}</span> : null}
    </div>
  );
}
