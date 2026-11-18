import { Suspense } from "react";
import { CartBar } from "@/components/CartBar";
import { MenuList } from "@/components/MenuList";
import { MenuSkeleton } from "@/components/MenuSkeleton";
import { allMenuItems, getMenu } from "@/lib/menu";
import { createClient } from "@/lib/supabase/server";

// Loads the menu on every visit, so a "Sold out" change shows straight away.
// (The server Supabase client reads cookies, which tells Next.js not to cache this.)
async function Menu() {
  const supabase = await createClient();
  const categories = await getMenu(supabase);
  return (
    <>
      <MenuList categories={categories} />
      <CartBar menuItems={allMenuItems(categories)} />
    </>
  );
}

export default function Home() {
  return (
    // Extra bottom padding so the cart bar never covers the last menu item.
    <main className="mx-auto w-full max-w-md flex-1 px-4 pt-6 pb-28">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Keteng Plates</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Menu</p>
      </header>

      <Suspense fallback={<MenuSkeleton />}>
        <Menu />
      </Suspense>
    </main>
  );
}
