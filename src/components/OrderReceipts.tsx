"use client";

import { useEffect, useState } from "react";
import { useAppearance } from "./AppearanceProvider";
import { Tr } from "./Tr";
import { downloadReceiptPdf, listOrderReceipts, type CustomerReceipt } from "@/lib/receipts";

/**
 * Payment receipts of an order, listed only when money was actually received
 * (a cash-on-delivery order has none until the courier has been paid).
 */
export function OrderReceipts({ token, orderNumber }: { token: string; orderNumber: string }) {
  const { tr } = useAppearance();
  const [receipts, setReceipts] = useState<CustomerReceipt[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listOrderReceipts(token, orderNumber)
      .then(setReceipts)
      .catch(() => setReceipts([]));
  }, [token, orderNumber]);

  if (receipts.length === 0) return null;

  async function download(receipt: CustomerReceipt) {
    setError(null);
    try {
      await downloadReceiptPdf(token, receipt);
    } catch (caught) {
      setError(caught instanceof Error ? tr(caught.message) : tr("Le PDF n'a pas pu être téléchargé."));
    }
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <span className="font-medium text-ink-soft">
        <Tr>Reçus de paiement</Tr>
      </span>
      {receipts.map((receipt) => (
        <button
          key={receipt.id}
          type="button"
          onClick={() => download(receipt)}
          className="self-start text-ink underline-offset-4 hover:text-gold hover:underline"
        >
          <Tr>Reçu</Tr> {receipt.number} <Tr>(PDF)</Tr>
        </button>
      ))}
      {error ? <span className="text-danger">{error}</span> : null}
    </div>
  );
}
