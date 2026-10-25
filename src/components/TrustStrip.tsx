const SIGNALS = [
  "Produits vérifiés avant expédition",
  "Garantie sur chaque appareil",
  "Paiement à la livraison disponible",
];

export function TrustStrip() {
  return (
    <section className="flex flex-col gap-3 border-y border-line py-5">
      <p className="max-w-md text-lg leading-snug text-ink">
        Le marché tech où chaque produit est authentique, garanti et livré chez vous.
      </p>
      <ul className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1.5">
        {SIGNALS.map((signal) => (
          <li key={signal} className="flex items-center gap-2 text-sm text-ink-soft">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
            {signal}
          </li>
        ))}
      </ul>
    </section>
  );
}
