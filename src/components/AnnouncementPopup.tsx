import { AnnouncementModal } from "@/components/AnnouncementModal";
import { getCurrentAnnouncement } from "@/lib/announcements";

/** Server side of the flash announcement: reads it, and renders nothing when none is running. */
export async function AnnouncementPopup() {
  const announcement = await getCurrentAnnouncement();
  if (!announcement) return null;

  return <AnnouncementModal announcement={announcement} />;
}
