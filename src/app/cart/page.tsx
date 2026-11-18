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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-8">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-[#1d5b45] hover:bg-[#f3efe7]">
          ← <span className="ml-2">Back to menu</span>
        </Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#e87932]">Ready when you are</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#143f31]">Your cart</h1>
      </header>

      <Suspense fallback={<MenuSkeleton />}>
        <CartWithFreshMenu />
      </Suspense>
    </main>
  );
}
