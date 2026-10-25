import { notFound } from "next/navigation";
import Link from "next/link";
import { formatMoneyParts } from "@/lib/money";
import { getOrder } from "@/lib/orders";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: PageProps<"/commande/[orderNumber]">) {
  const { orderNumber } = await params;
  const { phone } = await searchParams;

  if (typeof phone !== "string") {
    notFound();
  }

  const order = await getOrder(orderNumber, phone);

  if (!order) {
    notFound();
  }

  const subtotal = formatMoneyParts(order.subtotal);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 pb-16">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-gold">Commande enregistrée</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Merci, {order.customer_name.split(" ")[0]} !</h1>
        <p className="text-ink-soft">
          Commande <span className="text-ink">{order.order_number}</span> — paiement à la livraison.
        </p>
      </div>

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
        <p>Livraison : {order.delivery_address}{order.delivery_city ? `, ${order.delivery_city}` : ""}</p>
        <p>Téléphone : {order.customer_phone}</p>
      </div>

      <Link href="/" className="text-sm text-gold underline-offset-4 hover:underline">
        Continuer mes achats
      </Link>
    </main>
  );
}
