// Cart rules as plain functions. Each one returns a NEW cart and never changes
// the old one, which keeps React updates simple and makes the rules easy to test.
import type { MenuItem } from "@/types/menu";
import { lineTotalSen } from "./cart-total";

// What we keep in the cart: only the item id and how many. Names, prices and
// availability always come from the fresh menu, never from saved data.
export type CartLine = {
  itemId: number;
  quantity: number;
};

export function quantityInCart(cart: CartLine[], itemId: number): number {
  return cart.find((line) => line.itemId === itemId)?.quantity ?? 0;
}

// Adds one of an item (or one more if it is already in the cart).
// Sold-out items are refused: the cart comes back unchanged.
export function addItem(cart: CartLine[], item: MenuItem): CartLine[] {
  if (!item.isAvailable) return cart;

  if (quantityInCart(cart, item.id) === 0) {
    return [...cart, { itemId: item.id, quantity: 1 }];
  }
  return cart.map((line) =>
    line.itemId === item.id ? { ...line, quantity: line.quantity + 1 } : line,
  );
}

// Takes one away. Going below 1 removes the item from the cart.
export function decreaseQuantity(cart: CartLine[], itemId: number): CartLine[] {
  return cart
    .map((line) => (line.itemId === itemId ? { ...line, quantity: line.quantity - 1 } : line))
    .filter((line) => line.quantity >= 1);
}

export function removeItem(cart: CartLine[], itemId: number): CartLine[] {
  return cart.filter((line) => line.itemId !== itemId);
}

export type CartViewLine = {
  item: MenuItem;
  quantity: number;
  lineTotalSen: number;
};

// Joins the cart with the fresh menu. Items no longer on the menu are skipped.
export function buildCartLines(cart: CartLine[], menuItems: MenuItem[]): CartViewLine[] {
  const itemsById = new Map(menuItems.map((item) => [item.id, item]));
  return cart.flatMap((line) => {
    const item = itemsById.get(line.itemId);
    if (!item) return [];
    return [
      {
        item,
        quantity: line.quantity,
        lineTotalSen: lineTotalSen({ priceSen: item.priceSen, quantity: line.quantity }),
      },
    ];
  });
}

export type CheckoutProblem = "empty" | "sold_out" | "add_on_without_main";

// Reasons the customer cannot continue to checkout yet. Empty list = OK.
// Add-ons need at least one MAIN item; drinks do not count as a main.
// (Add-on and drink rules are pending owner confirmation, see issue #19.)
export function getCheckoutProblems(lines: CartViewLine[]): CheckoutProblem[] {
  if (lines.length === 0) return ["empty"];

  const problems: CheckoutProblem[] = [];
  if (lines.some((line) => !line.item.isAvailable)) {
    problems.push("sold_out");
  }
  const hasAddOn = lines.some((line) => line.item.categoryKind === "add_on");
  const hasMain = lines.some((line) => line.item.categoryKind === "main");
  if (hasAddOn && !hasMain) {
    problems.push("add_on_without_main");
  }
  return problems;
}
