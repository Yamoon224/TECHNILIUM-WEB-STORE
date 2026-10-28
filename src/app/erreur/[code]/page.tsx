import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorScreen } from "@/components/ErrorScreen";
import { errorCodes, errorInfo } from "@/lib/errors";

/**
 * /erreur/403, /erreur/503…: the page of an HTTP code. The web server or a proxy can send visitors
 * here for the errors that never reach the app (maintenance, bad gateway, timeouts).
 */
export function generateStaticParams() {
  return errorCodes().map((code) => ({ code }));
}

export const dynamicParams = false;

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ErrorByCode({ params }: PageProps<"/erreur/[code]">) {
  const { code } = await params;
  const info = errorInfo(code);

  if (!info) notFound();

  return <ErrorScreen info={info} />;
}
