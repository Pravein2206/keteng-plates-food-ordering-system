import { Suspense } from "react";
import { MenuList } from "@/components/MenuList";
import { MenuSkeleton } from "@/components/MenuSkeleton";
import { getMenu } from "@/lib/menu";
import { createClient } from "@/lib/supabase/server";

// Loads the menu on every visit, so a "Sold out" change shows straight away.
// (The server Supabase client reads cookies, which tells Next.js not to cache this.)
async function Menu() {
  const supabase = await createClient();
  const categories = await getMenu(supabase);
  return <MenuList categories={categories} />;
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
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
