"use client";

import { Tr } from "@/components/Tr";
import { useAppearance } from "@/components/AppearanceProvider";
import { useState } from "react";
import {
  downloadInvoicePdf,
  INVOICE_TYPE_LABEL,
  listOrderInvoices,
  type CustomerInvoice,
} from "@/lib/invoices";

/** Loads an order's invoices on demand, so the account page makes no request per order up front. */
export function OrderInvoices({ token, orderNumber }: { token: string; orderNumber: string }) {
  const { tr } = useAppearance();
  const [documents, setDocuments] = useState<CustomerInvoice[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (documents !== null) {
      setDocuments(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setDocuments(await listOrderInvoices(token, orderNumber));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tr("Factures indisponibles."));
    } finally {
      setLoading(false);
    }
  }

  async function download(invoice: CustomerInvoice) {
    setError(null);
    try {
      await downloadInvoicePdf(token, invoice);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tr("Le PDF n'a pas pu être téléchargé."));
    }
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className="self-start text-gold underline-offset-4 hover:underline disabled:opacity-50"
      >
        {documents === null ? <Tr>Mes factures</Tr> : <Tr>Masquer les factures</Tr>}
      </button>

      {documents?.length === 0 ? <span className="text-ink-soft"><Tr>Aucune facture émise pour le moment.</Tr></span> : null}

      {documents?.map((invoice) => (
        <button
          key={invoice.id}
          type="button"
          onClick={() => download(invoice)}
          className="self-start text-ink underline-offset-4 hover:text-gold hover:underline"
        >
          <Tr>{INVOICE_TYPE_LABEL[invoice.type]}</Tr> {invoice.number} <Tr>(PDF)</Tr>
        </button>
      ))}

      {error ? <span className="text-danger">{error}</span> : null}
    </div>
  );
}
