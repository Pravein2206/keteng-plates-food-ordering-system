import { formatRinggit } from "@/lib/money";
import type { MenuItem } from "@/types/menu";
import { AddToCartControl } from "./AddToCartControl";

// One menu item. Available items get an "Add" button (then "− 1 +").
// Sold-out items are greyed out, labelled "Sold out" and have no add button.
export function MenuItemCard({ item }: { item: MenuItem }) {
  const soldOut = !item.isAvailable;

  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800 ${
        soldOut ? "bg-zinc-100 dark:bg-zinc-900" : "bg-white dark:bg-zinc-950"
      }`}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.code}</p>
        <p
          className={`font-medium leading-snug ${
            soldOut ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          {item.name}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <p
          className={`font-semibold tabular-nums ${
            soldOut ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          {formatRinggit(item.priceSen)}
        </p>
        {soldOut ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-200">
            Sold out
          </span>
        ) : (
          <AddToCartControl item={item} />
        )}
      </div>
    </li>
  );
}
