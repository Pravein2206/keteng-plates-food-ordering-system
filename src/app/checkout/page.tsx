import { Suspense } from "react";
import { CheckoutView } from "@/components/CheckoutView";
import { MenuSkeleton } from "@/components/MenuSkeleton";
import { getDeliveryBatches } from "@/lib/delivery-batch-store";
import { allMenuItems, getMenu } from "@/lib/menu";
import { createClient } from "@/lib/supabase/server";

async function CheckoutWithFreshMenu() {
  const supabase = await createClient();
  const [categories, deliveryBatches] = await Promise.all([
    getMenu(supabase),
    getDeliveryBatches(supabase),
  ]);
  return (
    <CheckoutView
      menuItems={allMenuItems(categories)}
      deliveryBatches={deliveryBatches}
      initialNow={new Date().toISOString()}
    />
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-full">
      <Suspense fallback={<MenuSkeleton />}>
        <CheckoutWithFreshMenu />
      </Suspense>
    </div>
  );
}
