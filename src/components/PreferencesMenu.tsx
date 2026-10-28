"use client";

import { Check, Monitor, Moon, Palette, RotateCcw, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ACCENT_COLORS, type Language, type ThemeChoice } from "@/lib/appearance";
import { useAppearance } from "./AppearanceProvider";
import { useAuth } from "./AuthProvider";
import { Flag } from "./Flag";

const THEMES: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Clair", Icon: Sun },
  { value: "dark", label: "Sombre", Icon: Moon },
  { value: "auto", label: "Auto", Icon: Monitor },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English (US)" },
];

/** Header menu: theme (light, dark, automatic), accent colour and language. */
export function PreferencesMenu() {
  const { appearance, update, reset, tr } = useAppearance();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={tr("Préférences d'affichage")}
        aria-expanded={open}
        className="flex items-center rounded-sm px-2 py-2 text-ink transition-colors hover:bg-bg"
      >
        <Palette className="h-5 w-5" aria-hidden />
        <Flag language={appearance.language} className="ml-1.5 h-3.5 w-5" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={tr("Préférences d'affichage")}
          className="absolute right-0 top-full z-40 mt-2 flex w-72 flex-col gap-4 rounded-sm border border-line bg-surface p-4 text-sm text-ink shadow-lg"
        >
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{tr("Thème")}</h2>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update({ theme: value })}
                  aria-pressed={appearance.theme === value}
                  className={`flex flex-col items-center gap-1 rounded-sm border px-2 py-2 text-xs transition-colors ${
                    appearance.theme === value ? "border-gold bg-gold-highlight text-gold-bright" : "border-line hover:border-gold"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {tr(label)}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{tr("Couleur principale")}</h2>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => update({ accent: color })}
                  aria-label={color}
                  aria-pressed={appearance.accent === color}
                  style={{ backgroundColor: color }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                    appearance.accent === color ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""
                  }`}
                >
                  {appearance.accent === color ? <Check className="h-4 w-4 text-white" aria-hidden /> : null}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{tr("Langue")}</h2>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update({ language: value })}
                  aria-pressed={appearance.language === value}
                  className={`flex items-center justify-center gap-2 rounded-sm border px-3 py-2 transition-colors ${
                    appearance.language === value ? "border-gold bg-gold-highlight text-gold-bright" : "border-line hover:border-gold"
                  }`}
                >
                  <Flag language={value} />
                  {label}
                </button>
              ))}
            </div>
          </section>

          <p className="text-xs text-ink-soft">
            {user ? tr("La langue, la couleur et le thème sont enregistrés dans votre compte.") : tr("Enregistré sur cet appareil. Connectez-vous pour le retrouver partout.")}
          </p>

          <button type="button" onClick={reset} className="flex items-center gap-2 self-start text-xs text-ink-soft hover:text-ink">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> {tr("Réinitialiser")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
