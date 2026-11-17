import { Suspense } from "react";
import { CheckoutView } from "@/components/CheckoutView";
import { MenuSkeleton } from "@/components/MenuSkeleton";
import { allMenuItems, getMenu } from "@/lib/menu";
import { createClient } from "@/lib/supabase/server";

async function CheckoutWithFreshMenu() {
  const supabase = await createClient();
  const categories = await getMenu(supabase);
  return (
    <CheckoutView
      menuItems={allMenuItems(categories)}
      initialNow={new Date().toISOString()}
    />
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <CheckoutWithFreshMenu />
    </Suspense>
  );
}
