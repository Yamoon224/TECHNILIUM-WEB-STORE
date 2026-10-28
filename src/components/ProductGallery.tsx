"use client";

import { useState } from "react";
import { ProductTile } from "./ProductTile";

export interface GalleryImage {
  id: number;
  url: string;
}

/**
 * Main photo with a thumbnail strip. Without any photo it falls back to the
 * brand tile; with a single photo there is no strip.
 */
export function ProductGallery({
  id,
  brand,
  categoryName,
  alt,
  images,
}: {
  id: number;
  brand: string;
  categoryName: string | null;
  alt: string;
  images: GalleryImage[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = images.find((image) => image.id === selectedId) ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <ProductTile id={id} brand={brand} categoryName={categoryName} imageUrl={selected?.url} alt={alt} />

      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Photos du produit">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setSelectedId(image.id)}
                aria-label={`Voir la photo ${index + 1}`}
                aria-current={image.id === selected?.id}
                className={`block h-16 w-16 overflow-hidden rounded-sm border bg-white transition-colors ${
                  image.id === selected?.id ? "border-gold" : "border-line hover:border-gold"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" loading="lazy" className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
