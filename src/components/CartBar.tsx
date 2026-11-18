"use client";

import Link from "next/link";
import type { MenuItem } from "@/types/menu";
import { buildCartLines } from "@/lib/cart";
import { calculateCartTotal } from "@/lib/cart-total";
import { formatRinggit } from "@/lib/money";
import { useCart } from "./CartProvider";

// Sticky bar at the bottom of the menu: "3 items · RM31.00 · View cart".
// Hidden while the cart is empty.
export function CartBar({ menuItems }: { menuItems: MenuItem[] }) {
  const { lines } = useCart();
  const cartLines = buildCartLines(lines, menuItems);
  if (cartLines.length === 0) return null;

  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const { totalSen } = calculateCartTotal(
    cartLines.map((line) => ({ priceSen: line.item.priceSen, quantity: line.quantity })),
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[#e6dfd3] bg-[#fbf8f2]/95 px-4 py-3 backdrop-blur">
      <Link
        href="/cart"
        className="mx-auto flex min-h-12 w-full max-w-5xl items-center justify-between rounded-2xl bg-[#1d5b45] px-5 font-semibold text-white shadow-[0_8px_24px_rgba(20,63,49,0.2)] hover:bg-[#143f31]"
      >
        <span>
          {itemCount} {itemCount === 1 ? "item" : "items"} · {formatRinggit(totalSen)}
        </span>
        <span>View cart</span>
      </Link>
    </div>
  );
}
