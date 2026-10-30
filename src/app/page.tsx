import { Suspense } from "react";
import { Tr } from "@/components/Tr";
import { HomeCatalog } from "@/components/HomeCatalog";
import { AnnouncementPopup } from "@/components/AnnouncementPopup";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
    <Suspense
      fallback={<p className="mx-auto w-full max-w-5xl px-4 py-12 text-ink-soft"><Tr>Chargement du catalogue…</Tr></p>}
    >
      <HomeCatalog searchParams={searchParams} />
    </Suspense>
      <Suspense fallback={null}>
        <AnnouncementPopup />
      </Suspense>
    </>
  );
}
