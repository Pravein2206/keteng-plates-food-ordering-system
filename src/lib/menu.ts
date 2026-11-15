// Loads the menu from Supabase and turns database rows into app-friendly shapes.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MenuCategory } from "@/types/menu";

// Row shapes as they come back from the database (snake_case).
export type MenuItemRow = {
  id: number;
  code: string;
  name: string;
  price_sen: number;
  is_available: boolean;
  sort_order: number;
};

export type MenuCategoryRow = {
  id: number;
  name: string;
  sort_order: number;
  menu_items: MenuItemRow[];
};

export class MenuLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MenuLoadError";
  }
}

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
  a.sort_order - b.sort_order;

// Sorts categories and items into the owner's menu order and drops
// categories that have no items, so customers never see an empty heading.
export function toMenuCategories(rows: MenuCategoryRow[]): MenuCategory[] {
  return [...rows]
    .sort(bySortOrder)
    .map((category) => ({
      id: category.id,
      name: category.name,
      items: [...category.menu_items].sort(bySortOrder).map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        priceSen: item.price_sen,
        isAvailable: item.is_available,
      })),
    }))
    .filter((category) => category.items.length > 0);
}

export async function getMenu(supabase: SupabaseClient): Promise<MenuCategory[]> {
  const { data, error } = await supabase
    .from("menu_categories")
    .select("id, name, sort_order, menu_items (id, code, name, price_sen, is_available, sort_order)");

  if (error) {
    // Keep the technical details for developers; the page shows a friendly message.
    throw new MenuLoadError(`Could not load the menu: ${error.message}`);
  }

  return toMenuCategories((data ?? []) as MenuCategoryRow[]);
}
