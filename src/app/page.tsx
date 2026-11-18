import { Suspense } from "react";
import { UiIcon } from "@/components/UiIcon";
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
    <main className="flex-1 pb-32">
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-8 lg:pb-20">
        <div className="mb-6 flex justify-end">
          <span className="rounded-full bg-[#fff0e5] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#a94816]">
            Delivery only
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-[#f5e6d4] shadow-[0_24px_70px_rgba(20,63,49,0.12)]">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-[#e87932]/15" />
          <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-[#1d5b45]/10" />
          <div className="relative grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1fr_0.85fr] lg:px-16 lg:py-16">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#e87932]">Bonda Keteng Enterprise</p>
              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-[#143f31] sm:text-6xl">
                Comfort food,
                <span className="block text-[#e87932]">made to feel like home.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#496257] sm:text-lg">
                Discover our current menu of satisfying local favourites, prepared fresh and delivered in the next available batch.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#menu"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1d5b45] px-6 font-bold text-white shadow-[0_10px_20px_rgba(20,63,49,0.18)] hover:bg-[#143f31]"
                >
                  Order now <UiIcon name="arrow-up-right" size={18} className="ml-2" />
                </a>
                <span className="text-sm font-semibold text-[#627269]">Simple ordering. Fresh delivery.</span>
              </div>
            </div>

            <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
              <div className="absolute inset-4 rounded-full border border-[#e87932]/40" />
              <div className="absolute inset-10 rounded-full border border-[#e87932]/25" />
              <div className="absolute left-3 top-1/2 size-3 rounded-full bg-[#e87932]" />
              <div className="absolute right-5 top-1/4 size-3 rounded-full bg-[#1d5b45]" />
              <div className="relative flex size-64 items-center justify-center rounded-full border-[18px] border-white/80 bg-[#fff8e9] shadow-[0_22px_45px_rgba(20,63,49,0.18)] sm:size-72">
                <div className="flex size-40 flex-col items-center justify-center rounded-full border-2 border-[#e87932]/40 text-center">
                  <UiIcon name="sparkle" size={42} className="text-brand-orange" />
                  <span className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-[#1d5b45]">Keteng</span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[#e87932]">Plates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-brand-orange">The menu</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#143f31] sm:text-4xl">Choose your comfort plate</h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[#627269]">Browse by category, then add your favourites to the cart.</p>
        </div>
        <Suspense fallback={<MenuSkeleton />}>
          <Menu />
        </Suspense>
      </section>
    </main>
  );
}
