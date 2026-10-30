/**
 * The flash announcement of the home page, managed from the backoffice
 * (/annonces). A failure is not an error for the page: without data nothing
 * is shown.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export interface Announcement {
  id: number;
  title: string;
  image_url: string;
  link_url: string | null;
  /** Size of the pop-up in px (reduced to fit small screens). */
  width: number;
  height: number;
  /** Seconds after arriving on the page before it appears. */
  delay_seconds: number;
  /** Changes when the announcement is edited. */
  version: number | null;
}

/** The announcement to show now (the newest one running), or null. */
export async function getCurrentAnnouncement(): Promise<Announcement | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/announcements`, { next: { revalidate: 60 } });
    if (!response.ok) return null;
    const list = (await response.json()) as Announcement[];
    return list[0] ?? null;
  } catch {
    return null;
  }
}

export const DISMISSED_KEY = "technilium_announcement_dismissed";

interface Dismissed {
  id: number;
  version: number | null;
}

/** True when the visitor already closed this announcement (and it was not edited since). */
export function isDismissed(announcement: Pick<Announcement, "id" | "version">, stored: string | null): boolean {
  if (!stored) return false;
  try {
    const value = JSON.parse(stored) as Partial<Dismissed> | null;
    return value?.id === announcement.id && (value.version ?? null) === (announcement.version ?? null);
  } catch {
    return false;
  }
}

export function dismissalValue(announcement: Pick<Announcement, "id" | "version">): string {
  return JSON.stringify({ id: announcement.id, version: announcement.version ?? null } satisfies Dismissed);
}
