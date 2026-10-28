"use client";

import { useEffect, useRef } from "react";
import { adoptFromAccount, preferencesToSave, savePreferences, type AccountPreferences } from "@/lib/preferences";
import { useAppearance } from "./AppearanceProvider";
import { useAuth } from "./AuthProvider";

/**
 * Keeps the display preferences in the customer's account: signing in applies
 * the account's language, colour and theme on this device, and later changes made on
 * the device are saved back. Draws nothing. A guest is untouched (device only).
 */
export function AccountPreferencesSync() {
  const { user, token } = useAuth();
  const { appearance, update } = useAppearance();
  const account = useRef<AccountPreferences | null>(null);
  const tokenRef = useRef<string | null>(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Signing in or restoring a session: the account's choices win on this device.
  useEffect(() => {
    if (!user) {
      account.current = null;
      return;
    }

    account.current = { locale: user.locale, accent_color: user.accent_color ?? null, theme: user.theme ?? null };
    update(adoptFromAccount(account.current));
    // Only when the signed-in customer changes, not on every profile refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Later changes made on the device are saved to the account.
  useEffect(() => {
    const current = account.current;
    const bearer = tokenRef.current;
    if (!current || !bearer) return;

    const patch = preferencesToSave(appearance, current);
    if (!patch) return;

    savePreferences(bearer, patch)
      .then((saved) => {
        account.current = { locale: saved.locale, accent_color: saved.accent_color ?? null, theme: saved.theme ?? null };
      })
      .catch(() => undefined); // The device keeps the choice; the next change retries.
    // Runs when the language or colour changes, never on a login (see the effect above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appearance.language, appearance.accent, appearance.theme]);

  return null;
}
