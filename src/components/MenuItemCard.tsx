import { formatRinggit } from "@/lib/money";
import type { MenuItem } from "@/types/menu";
import { AddToCartControl } from "./AddToCartControl";
import { FoodPlaceholder } from "./FoodPlaceholder";

// One menu item. Available items get an "Add" button (then "− 1 +").
// Sold-out items are greyed out, labelled "Sold out" and have no add button.
export function MenuItemCard({ item }: { item: MenuItem }) {
  const soldOut = !item.isAvailable;

  return (
    <li
      className={`group overflow-hidden rounded-3xl border bg-surface shadow-card ${
        soldOut
          ? "border-[#e6dfd3] opacity-75"
          : "border-border bg-surface hover:-translate-y-1 hover:border-[#c5d5cb] hover:shadow-panel"
      }`}
    >
      <div className="p-2.5 pb-0">
        <FoodPlaceholder categoryKind={item.categoryKind} />
      </div>
      <div className="flex flex-col gap-5 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="inline-flex rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold tracking-wide text-text-muted">{item.code}</p>
            <p
              className={`mt-3 min-h-12 text-lg font-black leading-snug ${
                soldOut ? "text-[#819087]" : "text-[#18352b]"
              }`}
            >
              {item.name}
            </p>
          </div>
          <p
            className={`shrink-0 font-bold tabular-nums ${
              soldOut ? "text-[#819087]" : "text-[#1d5b45]"
            }`}
          >
            {formatRinggit(item.priceSen)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
        {soldOut ? (
          <span className="rounded-full bg-[#eadfd8] px-3 py-1.5 text-xs font-bold text-[#8b4b36]">
            Sold out
          </span>
        ) : (
            <span className="text-xs font-semibold text-[#819087]">Made for delivery</span>
        )}
          {!soldOut ? <AddToCartControl item={item} /> : null}
        </div>
      </div>
    </li>
  );
}
