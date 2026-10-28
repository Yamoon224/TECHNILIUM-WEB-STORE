const TILE_VARIANTS = ["product-tile-a", "product-tile-b", "product-tile-c"] as const;

export interface ProductTileProps {
  id: number;
  brand: string;
  categoryName: string | null;
  /** The real photo when the catalogue has one. */
  imageUrl?: string | null;
  alt?: string;
}

/**
 * Stands in for a product photo until real catalogue images exist: a brand
 * initial on a soft tint, deterministic per product so the same item always
 * matches.
 */
export function ProductTile({ id, brand, categoryName, imageUrl, alt = "" }: ProductTileProps) {
  const variant = TILE_VARIANTS[id % TILE_VARIANTS.length];

  if (imageUrl) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={alt} loading="lazy" className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className={`${variant} relative flex aspect-square w-full items-end justify-between overflow-hidden rounded-sm p-2`}
    >
      <span className="font-display text-6xl font-bold leading-none text-gold opacity-60" aria-hidden>
        {brand.charAt(0)}
      </span>
      {categoryName ? <span className="text-xs text-ink-soft">{categoryName}</span> : null}
    </div>
  );
}
