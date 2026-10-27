"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { formatMoneyParts } from "@/lib/money";
import { getOrder, recallLastOrder, showDeliveryCode, type Order } from "@/lib/orders";

/**
 * Receives the route's `params` promise unresolved and reads it here, inside
 * the page's Suspense boundary: awaiting it at the top of the page would
 * block the static shell (Cache Components).
 */
export function OrderConfirmation({ params }: Pick<PageProps<"/commande/[orderNumber]">, "params">) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    // sessionStorage isn't available during SSR; deferred to after mount
    // to avoid a client/server markup mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(recallLastOrder(orderNumber));
    setCheckedSession(true);
  }, [orderNumber]);

  if (!checkedSession) {
    return null;
  }

  if (!order) {
    return <PhoneLookupForm orderNumber={orderNumber} onFound={setOrder} />;
  }

  return <OrderSummary order={order} />;
}

function PhoneLookupForm({
  orderNumber,
  onFound,
}: {
  orderNumber: string;
  onFound: (order: Order) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const phone = String(new FormData(event.currentTarget).get("phone") ?? "");

    try {
      const order = await getOrder(orderNumber, phone);
      if (!order) {
        setError("Numéro de commande ou téléphone incorrect.");
        return;
      }
      onFound(order);
    } catch {
      setError("La commande est momentanément indisponible. Réessayez dans un instant.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="font-display text-xl font-semibold text-ink">Retrouver ma commande</h1>
      <p className="text-sm text-ink-soft">
        Commande <span className="text-ink">{orderNumber}</span>. Entrez le téléphone utilisé lors de la commande
        pour la consulter.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="phone"
          type="tel"
          required
          placeholder="07 00 00 00 00"
          className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-sm bg-gold px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Recherche…" : "Afficher ma commande"}
        </button>
      </form>
    </main>
  );
}

function OrderSummary({ order }: { order: Order }) {
  const subtotal = formatMoneyParts(order.subtotal);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 pb-16">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gold">Commande enregistrée</p>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Merci, {order.customer_name.split(" ")[0]} !
        </h1>
        <p className="text-ink-soft">
          Commande <span className="text-ink">{order.order_number}</span> — paiement à la livraison.
        </p>
      </div>

      {showDeliveryCode(order) ? (
        <div className="flex flex-col gap-1 rounded-sm border border-gold-deep p-4">
          <p className="text-sm text-ink-soft">Code de confirmation de livraison</p>
          <p className="font-display text-3xl tracking-[0.3em] text-gold-bright">{order.delivery_code}</p>
          <p className="text-xs text-ink-soft">
            Ne le communiquez au livreur qu&apos;au moment de recevoir votre colis : c&apos;est votre preuve de remise.
          </p>
        </div>
      ) : null}

      <ul className="flex flex-col divide-y divide-line border-y border-line text-sm">
        {order.items.map((item) => {
          const lineTotal = formatMoneyParts(item.line_total);
          return (
            <li key={item.offer_id} className="flex items-center justify-between py-2">
              <span className="text-ink">
                {item.product_name} <span className="text-ink-soft">× {item.quantity}</span>
              </span>
              <span className="text-ink">
                {lineTotal.amount} {lineTotal.label}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="self-end font-display text-lg">
        Total : <span className="gold-text font-semibold">{subtotal.amount}</span>{" "}
        <span className="text-ink-soft">{subtotal.label}</span>
      </p>

      <div className="flex flex-col gap-1 border-t border-line pt-4 text-sm text-ink-soft">
        <p>
          Livraison : {order.delivery_address}
          {order.delivery_city ? `, ${order.delivery_city}` : ""}
        </p>
        <p>Téléphone : {order.customer_phone}</p>
      </div>

      <Link href="/" className="text-sm text-gold underline-offset-4 hover:underline">
        Continuer mes achats
      </Link>
    </main>
  );
}
