import type { MenuCategory } from "@/types/menu";
import { MenuItemCard } from "./MenuItemCard";

// The whole menu, grouped by section, or a message when there is nothing to show.
export function MenuList({ categories }: { categories: MenuCategory[] }) {
  if (categories.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No items on the menu right now. Please check back later.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {categories.map((category) => (
        <section key={category.id} aria-labelledby={`category-${category.id}`}>
          <h2 id={`category-${category.id}`} className="mb-3 text-lg font-semibold">
            {category.name}
          </h2>
          <ul className="flex flex-col gap-2">
            {category.items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
