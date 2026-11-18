"use client";

import Link from "next/link";
import type { MenuItem } from "@/types/menu";
import { buildCartLines, getCheckoutProblems, type CheckoutProblem } from "@/lib/cart";
import { calculateCartTotal } from "@/lib/cart-total";
import { formatRinggit } from "@/lib/money";
import { useCart } from "./CartProvider";
import { QuantityStepper } from "./QuantityStepper";
import { FoodPlaceholder } from "./FoodPlaceholder";

const problemMessages: Record<Exclude<CheckoutProblem, "empty">, string> = {
  sold_out: "Some items have sold out. Please remove them to continue.",
  add_on_without_main: "Add-ons must be ordered with at least one main dish.",
};

const primaryButtonClass =
  "flex min-h-12 w-full items-center justify-center rounded-xl px-5 font-semibold";

// The cart: each line with its quantity and total, then subtotal, delivery and total.
// `menuItems` is the fresh menu, so prices and "Sold out" are always current.
export function CartView({ menuItems }: { menuItems: MenuItem[] }) {
  const { lines, add, decrease, remove } = useCart();
  const cartLines = buildCartLines(lines, menuItems);
  const problems = getCheckoutProblems(cartLines);

  if (cartLines.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-2xl border border-dashed border-[#d8d0c3] bg-white px-4 py-10 text-center text-[#627269]">
          Your cart is empty. Add something from the menu to continue.
        </p>
        <button
          type="button"
          disabled
          className={`${primaryButtonClass} cursor-not-allowed bg-[#e8e2d9] text-[#9a9f99]`}
        >
          Continue to checkout
        </button>
        <Link href="/" className="text-center font-semibold text-[#1d5b45] underline underline-offset-4">
          Back to menu
        </Link>
      </div>
    );
  }

  const total = calculateCartTotal(
    cartLines.map((line) => ({ priceSen: line.item.priceSen, quantity: line.quantity })),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <ul className="flex flex-col gap-3">
        {cartLines.map(({ item, quantity, lineTotalSen }) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-2xl border border-border bg-surface p-3 shadow-card sm:items-center sm:gap-4 sm:p-4"
          >
            <div className="block">
              <FoodPlaceholder categoryKind={item.categoryKind} compact />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#819087]">{item.code}</p>
                  <p className="mt-1 font-bold leading-snug text-[#18352b]">{item.name}</p>
                  <p className="mt-1 text-sm text-[#627269] tabular-nums">
                    {quantity} × {formatRinggit(item.priceSen)}
                  </p>
                </div>
                <p className="shrink-0 text-base font-black tabular-nums text-[#1d5b45]">{formatRinggit(lineTotalSen)}</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                {item.isAvailable ? (
                  <QuantityStepper itemName={item.name} quantity={quantity} onDecrease={() => decrease(item.id)} onIncrease={() => add(item)} />
                ) : (
                  <>
                    <span className="rounded-full bg-[#fff0e5] px-3 py-1.5 text-xs font-bold text-[#a94816]">Sold out, please remove</span>
                    <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.name} from cart`} className="min-h-11 px-2 text-sm font-bold text-[#a94816] underline decoration-[#efc8b7] underline-offset-4 hover:text-[#7d351e]">Remove</button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="lg:sticky lg:top-24">
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-panel sm:p-6">
          <p className="text-sm font-bold text-brand-orange">Order summary</p>
          <dl className="mt-4 flex flex-col gap-3 text-base tabular-nums">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatRinggit(total.subtotalSen)}</dd></div>
            <div className="flex justify-between"><dt>Delivery fee</dt><dd>{formatRinggit(total.deliveryFeeSen)}</dd></div>
            <div className="mt-1 flex justify-between border-t border-[#e6dfd3] pt-4 text-xl font-black text-[#1d5b45]"><dt>Total</dt><dd>{formatRinggit(total.totalSen)}</dd></div>
          </dl>
          <div className="mt-5">
            {problems.length > 0 ? (
              <div className="flex flex-col gap-3">
                <ul role="alert" className="flex flex-col gap-1 rounded-xl border border-[#efc8b7] bg-[#fff0e5] p-3 text-sm text-[#8b3f22]">
                  {problems.map((problem) => problem === "empty" ? null : <li key={problem}>{problemMessages[problem]}</li>)}
                </ul>
                <button type="button" disabled className={`${primaryButtonClass} cursor-not-allowed bg-[#e8e2d9] text-[#9a9f99]`}>Continue to checkout</button>
              </div>
            ) : (
              <Link href="/checkout" className={`${primaryButtonClass} bg-brand-green text-white shadow-card hover:bg-brand-green-dark`}>Continue to checkout</Link>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
