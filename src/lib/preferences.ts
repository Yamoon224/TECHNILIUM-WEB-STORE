/**
 * The signed-in customer's display preferences, kept in their account
 * (backend `PUT /auth/preferences`): language, accent colour and theme. A guest
 * keeps them on the device only.
 */

import { ACCENT_COLORS, isHexColor, type Appearance, type Language, type ThemeChoice } from "./appearance";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface AccountPreferences {
  locale: string;
  accent_color: string | null;
  /** null = automatic. */
  theme?: string | null;
}

export interface PreferencesPatch {
  locale?: Language;
  /** null = back to the default colour. */
  accent_color?: string | null;
  /** null = automatic. */
  theme?: ThemeChoice | null;
}

const DEFAULT_ACCENT = ACCENT_COLORS[0];

/** What to apply on this device when the customer signs in: their account wins; no stored colour keeps the local one. */
export function adoptFromAccount(account: AccountPreferences): Partial<Appearance> {
  const adopted: Partial<Appearance> = {};

  if (account.locale === "fr" || account.locale === "en") adopted.language = account.locale;
  if (isHexColor(account.accent_color)) adopted.accent = account.accent_color;
  // No stored theme means automatic, which is also what a new device starts with.
  if (account.theme === "light" || account.theme === "dark" || account.theme === "auto") adopted.theme = account.theme;

  return adopted;
}

/** What differs between the device and the account (the default colour is stored as null); null when nothing. */
export function preferencesToSave(
  appearance: Pick<Appearance, "language" | "accent" | "theme">,
  account: AccountPreferences,
): PreferencesPatch | null {
  const patch: PreferencesPatch = {};

  if (appearance.language !== account.locale) patch.locale = appearance.language;

  const wanted = appearance.accent.toLowerCase() === DEFAULT_ACCENT ? null : appearance.accent.toLowerCase();
  const stored = account.accent_color?.toLowerCase() ?? null;
  if (wanted !== stored) patch.accent_color = wanted;

  // Automatic is stored as null.
  const wantedTheme = appearance.theme === "auto" ? null : appearance.theme;
  const storedTheme = account.theme === "light" || account.theme === "dark" ? account.theme : null;
  if (wantedTheme !== storedTheme) patch.theme = wantedTheme;

  return Object.keys(patch).length > 0 ? patch : null;
}

export async function savePreferences(token: string, patch: PreferencesPatch): Promise<AccountPreferences> {
  const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error(`/auth/preferences responded with ${response.status}`);

  return (await response.json()) as AccountPreferences;
}
