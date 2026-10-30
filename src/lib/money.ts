/**
 * Centralized money formatting/conversion - the single place rounding rules live
 * (cahier des charges §11). Amounts always travel as integers in the currency's
 * smallest unit, mirroring the backend's Money value object.
 */

export type CurrencyCode = "XOF" | "XAF" | "EUR" | "USD" | "GHS" | "NGN";

interface CurrencyMeta {
  /** Number of minor units per major unit (e.g. 100 for cents, 1 for XOF). */
  minorUnits: number;
  locale: string;
  /** Short display label used when the amount and currency are styled separately. */
  label: string;
}

const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  XOF: { minorUnits: 1, locale: "fr-FR", label: "F CFA" },
  XAF: { minorUnits: 1, locale: "fr-FR", label: "F CFA" },
  EUR: { minorUnits: 100, locale: "fr-FR", label: "€" },
  USD: { minorUnits: 100, locale: "en-US", label: "$" },
  GHS: { minorUnits: 100, locale: "en-GH", label: "GH₵" },
  NGN: { minorUnits: 100, locale: "en-NG", label: "₦" },
};

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

function meta(currency: CurrencyCode): CurrencyMeta {
  const found = CURRENCIES[currency];
  if (!found) {
    throw new Error(`Unknown currency: ${currency}`);
  }
  return found;
}

/** Converts the smallest-unit integer amount to its major-unit decimal value. */
export function toMajorUnits(money: Money): number {
  return money.amount / meta(money.currency).minorUnits;
}

/** Formats a Money value for display, e.g. "12 500 F CFA" or "€ 49,90". */
export function formatMoney(money: Money): string {
  const { locale } = meta(money.currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: meta(money.currency).minorUnits === 1 ? 0 : 2,
    maximumFractionDigits: meta(money.currency).minorUnits === 1 ? 0 : 2,
  }).format(toMajorUnits(money));
}

/**
 * Splits a Money value into its grouped integer part and currency label, for
 * UI that styles the amount and the currency differently (e.g. a large price
 * with a small "F CFA" suffix rather than one undifferentiated string).
 */
export function formatMoneyParts(money: Money): { amount: string; label: string } {
  const { locale, label } = meta(money.currency);
  return {
    amount: new Intl.NumberFormat(locale, {
      minimumFractionDigits: meta(money.currency).minorUnits === 1 ? 0 : 2,
      maximumFractionDigits: meta(money.currency).minorUnits === 1 ? 0 : 2,
    }).format(toMajorUnits(money)),
    label,
  };
}

/** Adds two Money values of the same currency. Throws on currency mismatch. */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add different currencies: ${a.currency} / ${b.currency}`);
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function zeroMoney(currency: CurrencyCode): Money {
  return { amount: 0, currency };
}
