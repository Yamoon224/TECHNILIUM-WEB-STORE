import { ErrorScreen } from "@/components/ErrorScreen";

/** 404: an unknown address, or a product that no longer exists (`notFound()`). */
export default function NotFound() {
  return <ErrorScreen code={404} />;
}
