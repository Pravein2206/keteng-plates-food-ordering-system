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
    <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <Link
        href="/cart"
        className="mx-auto flex min-h-12 w-full max-w-md items-center justify-between rounded-full bg-zinc-900 px-5 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <span>
          {itemCount} {itemCount === 1 ? "item" : "items"} · {formatRinggit(totalSen)}
        </span>
        <span>View cart</span>
      </Link>
    </div>
  );
}
