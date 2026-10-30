/**
 * What the public help page takes from the server (backend `GET /help`): the
 * figures that must stay true - the return window, the support's first-response
 * target - and the contact channels the company has configured.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface HelpInfo {
  return_window_days: number;
  first_response_hours: number;
  contact: { phone?: string; whatsapp?: string; email?: string; hours?: string };
}

export async function getHelpInfo(): Promise<HelpInfo | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/help`, { headers: { Accept: "application/json" } });
    if (!response.ok) return null;

    return (await response.json()) as HelpInfo;
  } catch {
    return null;
  }
}

/** "+225 07 00 00 00 00" -> "tel:+2250700000000": digits and a leading plus only. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/(?!^\+)[^\d]/g, "")}`;
}

/** wa.me wants digits only, with the country code. */
export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function hasContact(contact: HelpInfo["contact"]): boolean {
  return Boolean(contact.phone || contact.whatsapp || contact.email);
}
