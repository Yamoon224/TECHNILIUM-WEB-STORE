"use client";

import { Tr } from "@/components/Tr";
import { useAppearance } from "@/components/AppearanceProvider";
import { Undo2 } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { formatMoneyParts } from "@/lib/money";
import type { Order } from "@/lib/orders";
import {
  listOrderReturns,
  RETURN_STATUS_LABEL,
  requestReturn,
  returnableQuantities,
  returnItemsPayload,
  ReturnsError,
  type CustomerReturn,
} from "@/lib/returns";

/**
 * Returns of a delivered order: the ones already asked for, with their
 * progress, and a form to ask for articles back. Shown only once the order is
 * delivered; the server enforces the return window and the quantities.
 */
export function OrderReturns({ order, token }: { order: Order; token: string }) {
  const { tr } = useAppearance();
  const [returns, setReturns] = useState<CustomerReturn[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    listOrderReturns(token, order.order_number)
      .then(setReturns)
      .catch((caught) => setError(caught instanceof ReturnsError ? caught.message : tr("Retours indisponibles.")))
      .finally(() => setLoaded(true));
  }, [token, order.order_number, tr]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (order.status !== "delivered") return null;

  const left = returnableQuantities(order.items, returns);
  const canReturnSomething = [...left.values()].some((quantity) => quantity > 0);

  return (
    <section className="flex flex-col gap-4 rounded-sm bg-surface p-4 shadow-card border-b-4 border-b-gold sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
        <Undo2 className="h-4 w-4 text-gold" aria-hidden /> <Tr>Retour d&apos;articles</Tr>
      </h2>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {returns.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {returns.map((request) => {
            const refunded = formatMoneyParts({ amount: request.refunded_amount, currency: request.currency });
            const asked = formatMoneyParts({ amount: request.requested_amount, currency: request.currency });

            return (
              <li key={request.id} className="flex flex-col gap-1 rounded-sm bg-bg p-3 text-sm">
                <p className="font-medium text-ink">
                  {request.number} - <Tr>{RETURN_STATUS_LABEL[request.status]}</Tr>
                </p>
                <p className="text-ink-soft">
                  <Tr>Motif :</Tr> {request.reason}
                </p>
                <p className="text-ink-soft">
                  {request.status === "refunded" ? (
                    <>
                      <Tr>Remboursé :</Tr> {refunded.amount} {refunded.label}
                    </>
                  ) : (
                    <>
                      <Tr>Montant demandé :</Tr> {asked.amount} {asked.label}
                    </>
                  )}
                </p>
                {request.decision_note ? (
                  <p className="text-ink">
                    <Tr>Réponse du support :</Tr> {request.decision_note}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {loaded && canReturnSomething ? (
        <ReturnForm order={order} token={token} left={left} onSent={refresh} />
      ) : loaded && returns.length === 0 ? (
        <p className="text-sm text-ink-soft">
          <Tr>Aucun article n&apos;est retournable pour cette commande.</Tr>
        </p>
      ) : null}
    </section>
  );
}

function ReturnForm({
  order,
  token,
  left,
  onSent,
}: {
  order: Order;
  token: string;
  left: Map<number, number>;
  onSent: () => void;
}) {
  const { tr } = useAppearance();
  const [quantities, setQuantities] = useState<Map<number, number>>(new Map());
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const items = returnItemsPayload(quantities);
    if (items.length === 0) {
      setFormError(tr("Choisissez au moins un article à retourner."));
      return;
    }

    setSubmitting(true);
    try {
      await requestReturn(token, { order_number: order.order_number, reason: reason.trim(), items });
      setQuantities(new Map());
      setReason("");
      onSent();
    } catch (caught) {
      setFormError(caught instanceof ReturnsError ? caught.message : tr("La demande n'a pas pu être envoyée."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-sm text-ink-soft">
        <Tr>
          Choisissez les articles à renvoyer et expliquez pourquoi. Le support vous répond ici ; le montant remboursé
          est calculé d&apos;après les articles choisis.
        </Tr>
      </p>

      <ul className="flex flex-col divide-y divide-line border-y border-line text-sm">
        {order.items.map((item) => {
          const available = left.get(item.offer_id) ?? 0;
          return (
            <li key={item.offer_id} className="flex items-center justify-between gap-3 py-2">
              <span className="text-ink">
                {item.brand} {item.product_name}
                <span className="block text-xs text-ink-soft">
                  {available > 0 ? (
                    <>
                      {available} <Tr>{available > 1 ? "retournables" : "retournable"}</Tr>
                    </>
                  ) : (
                    <Tr>Déjà concerné par un retour</Tr>
                  )}
                </span>
              </span>
              <label className="field w-24 shrink-0">
                <select
                  aria-label={`${tr("Quantité à retourner pour")} ${item.product_name}`}
                  value={quantities.get(item.offer_id) ?? 0}
                  disabled={available === 0}
                  onChange={(event) =>
                    setQuantities(new Map(quantities).set(item.offer_id, Number(event.target.value)))
                  }
                  className="rounded-sm border border-line bg-surface px-2 text-ink disabled:opacity-50"
                >
                  {Array.from({ length: available + 1 }, (_, quantity) => (
                    <option key={quantity} value={quantity}>
                      {quantity}
                    </option>
                  ))}
                </select>
                <span className="field-label">
                  <Tr>Qté</Tr>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <label className="field">
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          required
          minLength={5}
          maxLength={255}
          rows={2}
          placeholder={tr("Ex : l'écran présente une rayure à la réception")}
          className="rounded-sm border border-line bg-surface px-3 py-2 text-ink focus:border-gold focus:outline-none"
        />
        <span className="field-label">
          <Tr>Motif du retour</Tr>
        </span>
      </label>

      {formError ? <p className="text-sm text-danger">{formError}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold-bright disabled:opacity-60"
      >
        {submitting ? <Tr>Envoi…</Tr> : <Tr>Demander le retour</Tr>}
      </button>
    </form>
  );
}
