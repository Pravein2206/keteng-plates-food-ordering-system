"use client";

import type { MenuItem } from "@/types/menu";
import { quantityInCart } from "@/lib/cart";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";

// "Add" button for an available menu item. Once added it becomes "− 1 +".
// Only shown for available items (MenuItemCard hides it for sold-out ones).
export function AddToCartControl({ item }: { item: MenuItem }) {
  const { lines, add, decrease } = useCart();
  const quantity = quantityInCart(lines, item.id);

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => add(item)}
        aria-label={`Add ${item.name} to cart`}
        className="min-h-11 rounded-full bg-zinc-900 px-5 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Add
      </button>
    );
  }

  return (
    <QuantityStepper
      itemName={item.name}
      quantity={quantity}
      onDecrease={() => decrease(item.id)}
      onIncrease={() => add(item)}
    />
  );
}
