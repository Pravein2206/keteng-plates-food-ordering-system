// Fake menu items for tests. Never use real customer data in tests.
import type { MenuItem } from "@/types/menu";

export function makeItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 1,
    code: "T1",
    name: "Test Rice Set",
    priceSen: 800,
    isAvailable: true,
    categoryKind: "main",
    ...overrides,
  };
}

export const testMain = makeItem({ id: 1, code: "T1", name: "Test Rice Set", priceSen: 1500 });
export const testMain2 = makeItem({ id: 2, code: "T2", name: "Test Noodles", priceSen: 800 });
export const testSoldOut = makeItem({ id: 3, code: "T3", name: "Test Soup", isAvailable: false });
export const testAddOn = makeItem({
  id: 4,
  code: "X1",
  name: "Test Fried Egg",
  priceSen: 150,
  categoryKind: "add_on",
});
export const testDrink = makeItem({
  id: 5,
  code: "D1",
  name: "Test Iced Tea",
  priceSen: 100,
  categoryKind: "drink",
});

export const testMenuItems = [testMain, testMain2, testSoldOut, testAddOn, testDrink];
