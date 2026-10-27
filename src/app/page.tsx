import { Suspense } from "react";
import { HomeCatalog } from "@/components/HomeCatalog";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense
      fallback={<p className="mx-auto w-full max-w-5xl px-4 py-12 text-ink-soft">Chargement du catalogue…</p>}
    >
      <HomeCatalog searchParams={searchParams} />
    </Suspense>
  );
}
