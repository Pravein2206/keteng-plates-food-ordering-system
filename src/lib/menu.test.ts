import { describe, expect, test } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMenu, MenuLoadError, toMenuCategories, type MenuCategoryRow } from "./menu";

// Fake test data only.
const rows: MenuCategoryRow[] = [
  {
    id: 2,
    name: "Drinks",
    kind: "drink",
    sort_order: 20,
    menu_items: [
      { id: 21, code: "D2", name: "Test Drink B", price_sen: 150, is_available: false, sort_order: 20 },
      { id: 20, code: "D1", name: "Test Drink A", price_sen: 100, is_available: true, sort_order: 10 },
    ],
  },
  {
    id: 1,
    name: "Mains",
    kind: "main",
    sort_order: 10,
    menu_items: [
      { id: 10, code: "T1", name: "Test Rice Set", price_sen: 850, is_available: true, sort_order: 10 },
    ],
  },
  { id: 3, name: "Empty Section", kind: "add_on", sort_order: 30, menu_items: [] },
];

// A tiny stand-in for the Supabase client that returns a fixed result.
function fakeSupabase(result: { data: unknown; error: { message: string } | null }) {
  return {
    from: () => ({ select: async () => result }),
  } as unknown as SupabaseClient;
}

describe("toMenuCategories", () => {
  test("orders categories and items by sort_order", () => {
    const menu = toMenuCategories(rows);
    expect(menu.map((c) => c.name)).toEqual(["Mains", "Drinks"]);
    expect(menu[1].items.map((i) => i.code)).toEqual(["D1", "D2"]);
  });

  test("converts rows to app shape and keeps price in sen and availability", () => {
    const [mains, drinks] = toMenuCategories(rows);
    expect(mains.items[0]).toEqual({
      id: 10,
      code: "T1",
      name: "Test Rice Set",
      priceSen: 850,
      isAvailable: true,
      categoryKind: "main",
    });
    expect(drinks.items[1].isAvailable).toBe(false);
    expect(drinks.items[1].categoryKind).toBe("drink");
  });

  test("hides categories with no items", () => {
    expect(toMenuCategories(rows).some((c) => c.name === "Empty Section")).toBe(false);
  });
});

describe("getMenu", () => {
  test("returns the sorted menu when the query succeeds", async () => {
    const menu = await getMenu(fakeSupabase({ data: rows, error: null }));
    expect(menu).toHaveLength(2);
  });

  test("returns an empty menu when there is no data", async () => {
    expect(await getMenu(fakeSupabase({ data: null, error: null }))).toEqual([]);
  });

  test("throws MenuLoadError when Supabase returns an error", async () => {
    await expect(
      getMenu(fakeSupabase({ data: null, error: { message: "network down" } })),
    ).rejects.toThrow(MenuLoadError);
  });
});
