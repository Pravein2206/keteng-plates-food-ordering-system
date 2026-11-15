"use client";

import Link from "next/link";
import type { MenuItem } from "@/types/menu";
import { buildCartLines, getCheckoutProblems, type CheckoutProblem } from "@/lib/cart";
import { calculateCartTotal } from "@/lib/cart-total";
import { formatRinggit } from "@/lib/money";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";

const problemMessages: Record<Exclude<CheckoutProblem, "empty">, string> = {
  sold_out: "Some items have sold out. Please remove them to continue.",
  add_on_without_main: "Add-ons must be ordered with at least one main dish.",
};

const primaryButtonClass =
  "flex min-h-12 w-full items-center justify-center rounded-full px-5 font-medium";

// The cart: each line with its quantity and total, then subtotal, delivery and total.
// `menuItems` is the fresh menu, so prices and "Sold out" are always current.
export function CartView({ menuItems }: { menuItems: MenuItem[] }) {
  const { lines, add, decrease, remove } = useCart();
  const cartLines = buildCartLines(lines, menuItems);
  const problems = getCheckoutProblems(cartLines);

  if (cartLines.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Your cart is empty. Add something from the menu to continue.
        </p>
        <button
          type="button"
          disabled
          className={`${primaryButtonClass} cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400`}
        >
          Continue to checkout
        </button>
        <Link href="/" className="text-center font-medium underline underline-offset-4">
          Back to menu
        </Link>
      </div>
    );
  }

  const total = calculateCartTotal(
    cartLines.map((line) => ({ priceSen: line.item.priceSen, quantity: line.quantity })),
  );

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-2">
        {cartLines.map(({ item, quantity, lineTotalSen }) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.code}</p>
                <p className="font-medium leading-snug">{item.name}</p>
                <p className="text-sm text-zinc-600 tabular-nums dark:text-zinc-400">
                  {quantity} × {formatRinggit(item.priceSen)}
                </p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums">{formatRinggit(lineTotalSen)}</p>
            </div>

            {item.isAvailable ? (
              <QuantityStepper
                itemName={item.name}
                quantity={quantity}
                onDecrease={() => decrease(item.id)}
                onIncrease={() => add(item)}
              />
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-200">
                  Sold out, please remove
                </span>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="min-h-11 rounded-full border border-zinc-300 px-4 font-medium dark:border-zinc-700"
                >
                  Remove
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-2 border-t border-zinc-200 pt-4 tabular-nums dark:border-zinc-800">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatRinggit(total.subtotalSen)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery fee</dt>
          <dd>{formatRinggit(total.deliveryFeeSen)}</dd>
        </div>
        <div className="flex justify-between text-lg font-semibold">
          <dt>Total</dt>
          <dd>{formatRinggit(total.totalSen)}</dd>
        </div>
      </dl>

      {problems.length > 0 ? (
        <div className="flex flex-col gap-3">
          <ul role="alert" className="flex flex-col gap-1 text-sm text-red-800 dark:text-red-200">
            {problems.map((problem) =>
              problem === "empty" ? null : <li key={problem}>{problemMessages[problem]}</li>,
            )}
          </ul>
          <button
            type="button"
            disabled
            className={`${primaryButtonClass} cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400`}
          >
            Continue to checkout
          </button>
        </div>
      ) : (
        <Link
          href="/checkout"
          className={`${primaryButtonClass} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200`}
        >
          Continue to checkout
        </Link>
      )}
    </div>
  );
}
