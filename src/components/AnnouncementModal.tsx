"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAppearance } from "@/components/AppearanceProvider";
import { dismissalValue, DISMISSED_KEY, isDismissed, type Announcement } from "@/lib/announcements";

/**
 * The flash announcement: an image in a pop-up, shown on the home page after
 * the delay set in the backoffice. The cross (or Escape, or a click outside)
 * closes it, and it does not come back for that visitor unless the
 * announcement is edited.
 */
export function AnnouncementModal({ announcement }: { announcement: Announcement }) {
  const { tr } = useAppearance();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(DISMISSED_KEY);
    } catch {
      // Storage blocked: the announcement is simply shown on each visit.
    }
    if (isDismissed(announcement, stored)) return;

    const timer = window.setTimeout(() => setOpen(true), Math.max(0, announcement.delay_seconds) * 1000);
    return () => window.clearTimeout(timer);
  }, [announcement]);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, dismissalValue(announcement));
    } catch {
      // Not remembered, shown again next visit.
    }
  }

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
    // close() only reads the announcement, which is stable for the lifetime of the modal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={announcement.image_url} alt={announcement.title} className="h-full w-full object-cover" draggable={false} />
  );
  const link = announcement.link_url;
  const external = link !== null && /^https?:\/\//i.test(link);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={announcement.title}
        className="relative overflow-hidden rounded-sm bg-surface shadow-card-hover"
        // The configured size, reduced on small screens while keeping the ratio.
        style={{ width: `min(${announcement.width}px, 100%)`, aspectRatio: `${announcement.width} / ${announcement.height}`, maxHeight: "88vh" }}
      >
        {link ? (
          external ? (
            <a href={link} target="_blank" rel="noopener noreferrer" onClick={close} className="block h-full w-full">
              {image}
            </a>
          ) : (
            <Link href={link} onClick={close} className="block h-full w-full">
              {image}
            </Link>
          )
        ) : (
          image
        )}

        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label={tr("Fermer l'annonce")}
          title={tr("Fermer l'annonce")}
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-white"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
