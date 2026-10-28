import Link from "next/link";
import type { Category } from "@/lib/catalog";

export function CategoryRail({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <nav aria-label="Catégories" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <Pill href="/" active={!activeSlug}>
        Tous les produits
      </Pill>
      {categories.map((category) => (
        <Pill key={category.id} href={`/?category=${category.slug}`} active={category.slug === activeSlug}>
          {category.name}
        </Pill>
      ))}
    </nav>
  );
}

function Pill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-gold bg-gold text-white font-medium"
          : "border-line text-ink hover:border-gold"
      }`}
    >
      {children}
    </Link>
  );
}
