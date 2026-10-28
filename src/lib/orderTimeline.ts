/**
 * Customer-facing progress of an order: four steps taken from the order's
 * current status (the API exposes the status, not a history), so a step is
 * "done" when the order has reached or passed it.
 */

export const TIMELINE_STEPS = [
  { status: "pending", label: "Commande reçue" },
  { status: "confirmed", label: "Confirmée" },
  { status: "shipped", label: "Expédiée" },
  { status: "delivered", label: "Livrée" },
] as const;

export type StepState = "done" | "current" | "upcoming";

export interface TimelineStep {
  status: (typeof TIMELINE_STEPS)[number]["status"];
  label: string;
  state: StepState;
}

/** Null for a cancelled order (or an unknown status): the timeline is replaced by a notice. */
export function timelineFor(status: string): TimelineStep[] | null {
  const index = TIMELINE_STEPS.findIndex((step) => step.status === status);
  if (index === -1) return null;

  return TIMELINE_STEPS.map((step, position) => ({
    ...step,
    // A delivered order is finished: no step is left "current".
    state: position < index || status === "delivered" ? "done" : position === index ? "current" : "upcoming",
  }));
}

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "27 octobre 2026", or null when there is no usable date. */
export function formatOrderDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : DATE_FORMAT.format(date);
}
