import { CheckCircle2, ClipboardCheck, PackageCheck, Truck, XCircle, type LucideIcon } from "lucide-react";
import { formatStepDate, timelineFor, type TimelineStep } from "@/lib/orderTimeline";

const STEP_ICON: Record<TimelineStep["status"], LucideIcon> = {
  pending: ClipboardCheck,
  confirmed: PackageCheck,
  shipped: Truck,
  delivered: CheckCircle2,
};

/** Four-step progress bar for an order; a cancelled order shows a notice instead. */
export function OrderTimeline({
  status,
  history,
}: {
  status: string;
  history?: readonly { status: string; at: string }[];
}) {
  const steps = timelineFor(status, history);

  if (steps === null) {
    return status === "cancelled" ? (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <XCircle className="h-5 w-5 text-danger" aria-hidden /> Cette commande a été annulée.
      </p>
    ) : null;
  }

  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Avancement de la commande">
      {steps.map((step) => {
        const Icon = STEP_ICON[step.status];
        const active = step.state !== "upcoming";

        return (
          <li
            key={step.status}
            aria-current={step.state === "current" ? "step" : undefined}
            className="flex flex-col items-center gap-1 text-center"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                step.state === "done"
                  ? "bg-gold text-white"
                  : step.state === "current"
                    ? "border-2 border-gold bg-gold-highlight text-gold-bright"
                    : "border border-line bg-bg text-ink-soft"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className={`text-xs ${active ? "font-medium text-ink" : "text-ink-soft"}`}>{step.label}</span>
            {formatStepDate(step.at) ? <span className="text-[11px] text-ink-soft">{formatStepDate(step.at)}</span> : null}
            <span className="sr-only">
              {step.state === "done" ? "terminé" : step.state === "current" ? "en cours" : "à venir"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
