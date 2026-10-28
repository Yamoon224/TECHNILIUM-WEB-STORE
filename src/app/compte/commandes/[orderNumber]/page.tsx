import { Suspense } from "react";
import { OrderTracking } from "@/components/OrderTracking";

export default function OrderTrackingPage({ params }: PageProps<"/compte/commandes/[orderNumber]">) {
  return (
    <Suspense fallback={null}>
      <OrderTracking params={params} />
    </Suspense>
  );
}
