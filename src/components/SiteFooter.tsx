import Link from "next/link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Besoin d'aide ?",
    links: [
      { label: "Centre d'aide et support", href: "/aide" },
      { label: "Suivre ma commande", href: "/compte" },
      { label: "Retours et remboursements", href: "/aide" },
    ],
  },
  {
    title: "Mon compte",
    links: [
      { label: "Connexion", href: "/connexion" },
      { label: "Mes commandes et factures", href: "/compte" },
      { label: "Mon panier", href: "/panier" },
    ],
  },
  {
    title: "Pourquoi Technilium",
    links: [
      { label: "Produits vérifiés avant expédition", href: "/" },
      { label: "Garantie sur chaque appareil", href: "/" },
      { label: "Paiement à la livraison", href: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-12 bg-ink text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">{column.title}</h2>
            <ul className="flex flex-col gap-2 text-sm text-white/80">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="underline-offset-4 hover:text-white hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        © Technilium — Produits tech authentiques, livrés chez vous.
      </p>
    </footer>
  );
}
