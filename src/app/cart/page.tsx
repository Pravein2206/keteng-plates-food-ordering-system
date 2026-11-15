import Link from "next/link";
import { Suspense } from "react";
import { CartView } from "@/components/CartView";
import { MenuSkeleton } from "@/components/MenuSkeleton";
import { allMenuItems, getMenu } from "@/lib/menu";
import { createClient } from "@/lib/supabase/server";

// Loads the fresh menu so the cart always uses current prices and sold-out status.
// If loading fails, app/error.tsx shows the message with "Try again".
async function CartWithFreshMenu() {
  const supabase = await createClient();
  const categories = await getMenu(supabase);
  return <CartView menuItems={allMenuItems(categories)} />;
}

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <header className="mb-6">
        <Link href="/" className="text-sm font-medium underline underline-offset-4">
          ← Back to menu
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Your cart</h1>
      </header>

      <Suspense fallback={<MenuSkeleton />}>
        <CartWithFreshMenu />
      </Suspense>
    </main>
  );
}
