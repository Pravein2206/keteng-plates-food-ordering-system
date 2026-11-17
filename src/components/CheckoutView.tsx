"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  DELIVERY_BATCHES,
  getDeliveryBatchAvailability,
  type DeliveryBatchAvailability,
} from "@/lib/delivery-batches";
import {
  validateDeliveryDetails,
  type DeliveryFieldErrors,
  type DeliveryFormValues,
} from "@/lib/delivery-details";
import { buildCartLines, getCheckoutProblems, type CheckoutProblem } from "@/lib/cart";
import { calculateCartTotal } from "@/lib/cart-total";
import { formatRinggit } from "@/lib/money";
import type { MenuItem } from "@/types/menu";
import type { CheckoutData } from "@/types/checkout";
import { useCart } from "./CartProvider";

const checkoutProblemMessages: Record<Exclude<CheckoutProblem, "empty">, string> = {
  sold_out: "Some items have sold out. Please remove them from your cart.",
  add_on_without_main: "Add-ons must be ordered with at least one main dish.",
};

const inputClass =
  "mt-1 min-h-12 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base dark:border-zinc-700 dark:bg-zinc-900";

const initialFormValues: DeliveryFormValues = {
  fullName: "",
  phoneNumber: "",
  address: "",
  batchId: "",
};

function getBatchMessage(reason: DeliveryBatchAvailability["reason"]): string {
  switch (reason) {
    case "expired":
      return "Cut-off has passed";
    case "invalid_schedule":
      return "Schedule needs review";
    case "disabled":
      return "Unavailable";
    default:
      return "Available";
  }
}

export function CheckoutView({
  menuItems,
  initialNow,
}: {
  menuItems: MenuItem[];
  initialNow: string;
}) {
  const { lines } = useCart();
  const cartLines = buildCartLines(lines, menuItems);
  const cartProblems = getCheckoutProblems(cartLines);
  const hasMissingItems = cartLines.length !== lines.length;
  const isCartValid =
    lines.length > 0 &&
    cartLines.length > 0 &&
    cartProblems.length === 0 &&
    !hasMissingItems;
  const total = cartLines.length
    ? calculateCartTotal(
        cartLines.map((line) => ({ priceSen: line.item.priceSen, quantity: line.quantity })),
      )
    : null;

  const [values, setValues] = useState(initialFormValues);
  const [errors, setErrors] = useState<DeliveryFieldErrors>({});
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [now, setNow] = useState(() => new Date(initialNow));

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const updateValue = <K extends keyof DeliveryFormValues>(
    key: K,
    value: DeliveryFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors({});
    setCheckoutData(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutData(null);
    if (!isCartValid) return;

    const validation = validateDeliveryDetails(values, new Date());
    setNow(new Date());
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setCheckoutData({
      items: lines.map(({ itemId, quantity }) => ({ itemId, quantity })),
      delivery: validation.details,
    });
  };

  if (lines.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <header className="mb-6">
          <Link href="/cart" className="text-sm font-medium underline underline-offset-4">
            ← Back to cart
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Delivery details</h1>
        </header>
        <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center dark:border-zinc-700">
          <p>Your cart is empty. Add something from the menu before checkout.</p>
          <Link href="/" className="mt-4 inline-block font-medium underline underline-offset-4">
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  if (!isCartValid || total === null) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <header className="mb-6">
          <Link href="/cart" className="text-sm font-medium underline underline-offset-4">
            ← Back to cart
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Delivery details</h1>
        </header>
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
        >
          <p className="font-semibold">Your cart needs attention before checkout.</p>
          <ul className="mt-2 list-inside list-disc text-sm">
            {hasMissingItems ? (
              <li>Some items are no longer on the menu. Please review your cart.</li>
            ) : null}
            {cartProblems.map((problem) =>
              problem === "empty" ? null : <li key={problem}>{checkoutProblemMessages[problem]}</li>,
            )}
          </ul>
          <Link href="/cart" className="mt-4 inline-block font-medium underline underline-offset-4">
            Review your cart
          </Link>
        </div>
      </main>
    );
  }

  const selectedBatch = DELIVERY_BATCHES.find((batch) => batch.id === values.batchId);
  const selectedBatchAvailability = selectedBatch
    ? getDeliveryBatchAvailability(selectedBatch, now)
    : null;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <header className="mb-6">
        <Link href="/cart" className="text-sm font-medium underline underline-offset-4">
          ← Back to cart
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Delivery details</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Add your contact details and choose an available delivery batch.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem]">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-semibold">Your details</h2>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label htmlFor="full-name" className="font-medium">
                  Full name
                </label>
                <input
                  id="full-name"
                  name="fullName"
                  required
                  autoComplete="name"
                  value={values.fullName}
                  onChange={(event) => updateValue("fullName", event.target.value)}
                  placeholder="e.g. Nur Aisyah Ahmad"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "full-name-error" : undefined}
                  className={inputClass}
                />
                {errors.fullName ? (
                  <p id="full-name-error" className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {errors.fullName}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="phone-number" className="font-medium">
                  Malaysian phone number
                </label>
                <input
                  id="phone-number"
                  name="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  value={values.phoneNumber}
                  onChange={(event) => updateValue("phoneNumber", event.target.value)}
                  placeholder="e.g. 012-345 6789"
                  aria-invalid={Boolean(errors.phoneNumber)}
                  aria-describedby={errors.phoneNumber ? "phone-number-error" : undefined}
                  className={inputClass}
                />
                {errors.phoneNumber ? (
                  <p id="phone-number-error" className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {errors.phoneNumber}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="delivery-address" className="font-medium">
                  Delivery address
                </label>
                <textarea
                  id="delivery-address"
                  name="address"
                  required
                  autoComplete="street-address"
                  rows={3}
                  value={values.address}
                  onChange={(event) => updateValue("address", event.target.value)}
                  placeholder="House number, street, area, postcode and city"
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={errors.address ? "delivery-address-error" : undefined}
                  className={`${inputClass} py-3`}
                />
                {errors.address ? (
                  <p id="delivery-address-error" className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {errors.address}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <fieldset
            aria-describedby={errors.batchId ? "batch-error" : undefined}
            className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <legend className="px-1 text-lg font-semibold">Delivery batch</legend>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Delivery times and order cut-offs are awaiting restaurant confirmation.
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {DELIVERY_BATCHES.map((batch) => {
                const availability = getDeliveryBatchAvailability(batch, now);
                const isSelected = values.batchId === batch.id;
                return (
                  <label
                    key={batch.id}
                    className={`flex min-h-14 items-center gap-3 rounded-lg border p-3 ${
                      availability.available
                        ? "cursor-pointer border-zinc-300 dark:border-zinc-700"
                        : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
                    } ${isSelected ? "ring-2 ring-zinc-900 dark:ring-zinc-100" : ""}`}
                  >
                    <input
                      type="radio"
                      name="batchId"
                      value={batch.id}
                      required
                      checked={isSelected}
                      disabled={!availability.available}
                      onChange={() => updateValue("batchId", batch.id)}
                      aria-describedby={`batch-status-${batch.id}`}
                      className="size-4 accent-zinc-900"
                    />
                    <span className="flex flex-1 items-center justify-between gap-2">
                      <span className="font-medium">{batch.label}</span>
                      <span id={`batch-status-${batch.id}`} className="text-xs">
                        {getBatchMessage(availability.reason)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.batchId ? (
              <p id="batch-error" role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
                {errors.batchId}
              </p>
            ) : null}
          </fieldset>

          <button
            type="submit"
            disabled={!isCartValid}
            className="min-h-12 rounded-full bg-zinc-900 px-5 font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
          >
            Review delivery details
          </button>

          {checkoutData ? (
            <p
              role="status"
              className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
            >
              Your details are ready for {checkoutData.delivery.deliveryBatchLabel}. Final order
              submission is not available yet; no order has been saved.
            </p>
          ) : null}
        </form>

        <aside className="h-fit rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {cartLines.map(({ item, quantity, lineTotalSen }) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0">
                  {item.name} <span className="text-zinc-500">× {quantity}</span>
                </span>
                <span className="shrink-0 tabular-nums">{formatRinggit(lineTotalSen)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t border-zinc-200 pt-4 tabular-nums dark:border-zinc-800">
            <div className="flex justify-between">
              <dt>Food subtotal</dt>
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

          <div className="mt-4 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
            <h3 className="font-semibold">Delivery review</h3>
            <dl className="mt-2 flex flex-col gap-2">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Batch</dt>
                <dd>
                  {selectedBatch && selectedBatchAvailability?.available
                    ? selectedBatch.label
                    : "Choose an available batch"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Address</dt>
                <dd className="break-words">{values.address.trim() || "Enter your address above"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Contact</dt>
                <dd className="break-words">
                  {values.fullName.trim() || "Enter your name above"}
                  {values.phoneNumber.trim() ? ` · ${values.phoneNumber.trim()}` : ""}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </main>
  );
}
