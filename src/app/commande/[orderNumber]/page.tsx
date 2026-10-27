import { Suspense } from "react";
import { OrderConfirmation } from "@/components/OrderConfirmation";

export default function OrderConfirmationPage({ params }: PageProps<"/commande/[orderNumber]">) {
  return (
    <Suspense fallback={null}>
      <OrderConfirmation params={params} />
    </Suspense>
  );
}
