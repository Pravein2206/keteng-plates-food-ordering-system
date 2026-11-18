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
        className="min-h-11 shrink-0 rounded-full bg-[#1d5b45] px-5 font-bold text-white shadow-[0_8px_18px_rgba(20,63,49,0.14)] hover:-translate-y-0.5 hover:bg-[#143f31] hover:shadow-md"
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
