import Link from "next/link";
import { Tr } from "@/components/Tr";
import { LayoutGrid, type LucideIcon } from "lucide-react";
import type { Category } from "@/lib/catalog";
import { categoryIcon } from "@/lib/categoryIcons";

/** Vertical category menu on large screens, a scrolling strip on small ones. */
export function CategoryRail({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <nav
      aria-labelledby="categories-nav-title"
      className="flex gap-1 overflow-x-auto rounded-sm bg-surface p-2 shadow-card border-b-4 border-b-gold lg:flex-col lg:self-start lg:overflow-visible"
    >
      <h2 id="categories-nav-title" className="sr-only">
        <Tr>Catégories</Tr>
      </h2>
      <Item href="/" active={!activeSlug} Icon={LayoutGrid}>
        <Tr>Tous les produits</Tr>
      </Item>
      {categories.map((category) => (
        <Item
          key={category.id}
          href={`/?category=${category.slug}`}
          active={category.slug === activeSlug}
          Icon={categoryIcon(category)}
        >
          {category.name}
        </Item>
      ))}
    </nav>
  );
}

function Item({
  href,
  active,
  Icon,
  children,
}: {
  href: string;
  active: boolean;
  Icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-sm px-3 py-2 text-sm transition-colors ${
        active ? "bg-gold-highlight font-semibold text-gold-bright" : "text-ink hover:bg-bg"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
