"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  accentVariables,
  DEFAULT_APPEARANCE,
  loadAppearance,
  MANAGED_VARIABLES,
  resolveTheme,
  saveAppearance,
  type Appearance,
} from "@/lib/appearance";
import { languageCookie, languageFromCookieString } from "@/lib/language";
import { format, PHRASES_EN } from "@/lib/phrases";

interface AppearanceContextValue {
  appearance: Appearance;
  theme: "light" | "dark";
  update: (patch: Partial<Appearance>) => void;
  reset: () => void;
  /** Translates a French text (falls back to the French when there is no English). */
  tr: (french: string) => string;
  /** Translates a French sentence with {name} placeholders, then fills them. */
  trf: (french: string, values: Record<string, string | number>) => string;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

/**
 * Holds the visitor's theme, accent colour and language, persists them on the
 * device and applies them to the document. Starts from the defaults and reads
 * storage after mount so server and first client render agree; an inline
 * script in the layout sets the theme before paint.
 */
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    // Storage and media queries only exist in the browser, hence after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAppearance(loadAppearance());

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(query.matches);

    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }, []);

  const theme = resolveTheme(appearance.theme, systemDark);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = theme;
    root.lang = appearance.language;

    // The server renders catalogue texts from this cookie: when it differs from the chosen
    // language, correct it and ask Next to re-render the server parts in the right language.
    if (languageFromCookieString(document.cookie) !== appearance.language) {
      document.cookie = languageCookie(appearance.language);
      router.refresh();
    }

    for (const name of MANAGED_VARIABLES) root.style.removeProperty(name);
    for (const [name, value] of Object.entries(accentVariables(appearance.accent, theme))) root.style.setProperty(name, value);
  }, [appearance, theme, router]);

  const update = useCallback((patch: Partial<Appearance>) => {
    setAppearance((current) => {
      const next = { ...current, ...patch };
      saveAppearance(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    saveAppearance(DEFAULT_APPEARANCE);
    setAppearance(DEFAULT_APPEARANCE);
  }, []);

  const language = appearance.language;
  const tr = useCallback((french: string) => (language === "en" ? (PHRASES_EN[french] ?? french) : french), [language]);

  const trf = useCallback((french: string, values: Record<string, string | number>) => format(tr(french), values), [tr]);

  const value = useMemo<AppearanceContextValue>(
    () => ({ appearance, theme, update, reset, tr, trf }),
    [appearance, theme, update, reset, tr, trf],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error("useAppearance must be used inside <AppearanceProvider>");
  return context;
}
