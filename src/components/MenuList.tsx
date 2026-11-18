import type { MenuCategory } from "@/types/menu";
import { MenuItemCard } from "./MenuItemCard";

// The whole menu, grouped by section, or a message when there is nothing to show.
export function MenuList({ categories }: { categories: MenuCategory[] }) {
  if (categories.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#d8d0c3] bg-white px-4 py-10 text-center text-[#627269]">
        No items on the menu right now. Please check back later.
      </p>
    );
  }

  return (
    <div id="menu" className="scroll-mt-24">
      <nav
        aria-label="Menu categories"
        className="sticky top-16 z-20 -mx-4 mb-10 flex gap-2 overflow-x-auto border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <a
            key={category.id}
            href={`#category-${category.id}`}
            className="shrink-0 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-bold text-brand-green hover:border-brand-green hover:bg-surface-muted"
          >
            {category.name}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-14">
        {categories.map((category) => (
          <section key={category.id} id={`category-${category.id}`} aria-labelledby={`category-${category.id}-heading`} className="scroll-mt-32">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-sm font-bold text-brand-orange">Menu selection</p>
                <h2 id={`category-${category.id}-heading`} className="mt-1 text-2xl font-bold tracking-tight text-brand-green-dark">
                  {category.name}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-[#edf5ef] px-3 py-1.5 text-sm font-semibold text-[#496257]">{category.items.length} items</span>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
