"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { OrderInvoices } from "@/components/OrderInvoices";
import { formatMoneyParts } from "@/lib/money";
import { listMyOrders, OrdersError, partialLabel, showDeliveryCode, type Order } from "@/lib/orders";

export default function AccountPage() {
  const router = useRouter();
  const { status, token, user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!token) return;

    setLoading(true);
    listMyOrders(token)
      .then(setOrders)
      .catch((caught) => setError(caught instanceof OrdersError ? caught.message : "Commandes indisponibles."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (status === "checking") {
    return <p className="px-4 py-16 text-center text-sm text-ink-soft">Vérification de la session…</p>;
  }

  if (!user || !token) {
    return (
      <main className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 px-4">
        <p className="text-ink-soft">Connectez-vous pour accéder à votre compte.</p>
        <Link href="/connexion" className="text-sm text-gold underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto my-4 flex w-[calc(100%-2rem)] max-w-2xl flex-1 flex-col gap-8 rounded-sm bg-surface p-5 shadow-sm sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{user.name}</h1>
          {user.email ? <p className="text-sm text-ink-soft">{user.email}</p> : null}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-sm border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-gold"
        >
          Se déconnecter
        </button>
      </div>

      <p className="text-sm text-ink-soft">
        Un souci avec une commande ?{" "}
        <Link href="/aide" className="text-gold underline-offset-4 hover:underline">
          Contacter le support
        </Link>
      </p>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold text-ink">Mes commandes</h2>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-ink-soft">Chargement…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Aucune commande pour l&apos;instant.{" "}
            <Link href="/" className="text-gold underline-offset-4 hover:underline">
              Voir le catalogue
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line border-y border-line text-sm">
            {orders.map((order) => {
              const subtotal = formatMoneyParts(order.subtotal);
              return (
                <li key={order.order_number} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-ink">{order.order_number}</span>
                    <span className="text-xs text-ink-soft">
                      {order.items.length} article{order.items.length > 1 ? "s" : ""}
                    </span>
                    {showDeliveryCode(order) ? (
                      <span className="text-xs text-gold-bright">Code de livraison : {order.delivery_code}</span>
                    ) : null}
                    {order.partial
                      ? order.sub_orders?.map((parcel, index) => (
                          <span key={parcel.id} className="text-xs text-ink-soft">
                            Colis {index + 1} : {STATUS_LABEL[parcel.status] ?? parcel.status}
                          </span>
                        ))
                      : null}
                    {order.status !== "pending" && order.status !== "cancelled" ? (
                      <OrderInvoices token={token} orderNumber={order.order_number} />
                    ) : null}
                  </div>
                  <span className="text-ink-soft">
                    {partialLabel(order) ?? STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-ink">
                    {subtotal.amount} {subtotal.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};
