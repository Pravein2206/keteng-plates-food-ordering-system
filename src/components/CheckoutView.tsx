"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  getDeliveryBatchAvailability,
  type DeliveryBatchAvailability,
  type DeliveryBatchConfig,
} from "@/lib/delivery-batches";
import {
  validateDeliveryDetails,
  type DeliveryFieldErrors,
  type DeliveryFormValues,
} from "@/lib/delivery-details";
import { buildCartLines, getCheckoutProblems, type CheckoutProblem } from "@/lib/cart";
import { calculateCartTotal } from "@/lib/cart-total";
import { formatRinggit } from "@/lib/money";
import { isIdempotencyKey } from "@/lib/order-submission";
import type { MenuItem } from "@/types/menu";
import type { CheckoutData } from "@/types/checkout";
import { useCart } from "./CartProvider";

const checkoutProblemMessages: Record<Exclude<CheckoutProblem, "empty">, string> = {
  sold_out: "Some items have sold out. Please remove them from your cart.",
  add_on_without_main: "Add-ons must be ordered with at least one main dish.",
};

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-[#d8d0c3] bg-[#fffdf9] px-4 text-base text-[#18352b] outline-none placeholder:text-[#9a9f99] focus:border-[#1d5b45] focus:ring-4 focus:ring-[#1d5b45]/10";

const initialFormValues: DeliveryFormValues = {
  fullName: "",
  phoneNumber: "",
  address: "",
  batchId: "",
};

const idempotencyStorageKey = "keteng.order-submission-key";

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
  deliveryBatches,
  initialNow,
}: {
  menuItems: MenuItem[];
  deliveryBatches: readonly DeliveryBatchConfig[];
  initialNow: string;
}) {
  const { lines, remove } = useCart();
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
  const [submissionError, setSubmissionError] = useState("");
  const [isIdempotencyConflict, setIsIdempotencyConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ reference: string; totalSen: number } | null>(
    null,
  );
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
    setSubmissionError("");
    setIsIdempotencyConflict(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutData(null);
    setSubmissionError("");
    setIsIdempotencyConflict(false);
    if (!isCartValid) return;

    const validation = validateDeliveryDetails(values, new Date(), deliveryBatches);
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

  const handlePlaceOrder = async () => {
    if (!checkoutData || isSubmitting) return;
    setSubmissionError("");
    setIsIdempotencyConflict(false);
    setIsSubmitting(true);

    try {
      let idempotencyKey = window.sessionStorage.getItem(idempotencyStorageKey);
      if (!idempotencyKey || !isIdempotencyKey(idempotencyKey)) {
        idempotencyKey = window.crypto.randomUUID();
        window.sessionStorage.setItem(idempotencyStorageKey, idempotencyKey);
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(checkoutData),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "We could not confirm that your order was saved. Retry with the same checkout details.";
        setSubmissionError(message);
        setIsIdempotencyConflict(response.status === 409);
        return;
      }

      if (
        typeof result !== "object" ||
        result === null ||
        !("reference" in result) ||
        typeof result.reference !== "string" ||
        !("totalSen" in result) ||
        typeof result.totalSen !== "number" ||
        !Number.isSafeInteger(result.totalSen) ||
        result.totalSen < 1
      ) {
        setSubmissionError("We could not confirm that your order was saved. Retry with the same checkout details.");
        return;
      }

      setConfirmation({ reference: result.reference, totalSen: result.totalSen });
      window.sessionStorage.removeItem(idempotencyStorageKey);
      lines.forEach(({ itemId }) => remove(itemId));
    } catch {
      setSubmissionError(
        "We could not confirm that your order was saved. Retry with the same checkout details.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <section
          role="status"
          className="rounded-3xl border border-[#b9d8c3] bg-[#edf5ef] p-6 text-[#143f31] shadow-[0_20px_60px_rgba(20,63,49,0.08)]"
        >
          <h1 className="text-2xl font-semibold">Order submitted</h1>
          <p className="mt-2">Your order was saved successfully.</p>
          <dl className="mt-4 flex flex-col gap-2">
            <div className="flex justify-between gap-4">
              <dt>Order reference</dt>
              <dd className="font-semibold">{confirmation.reference}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Total</dt>
              <dd className="font-semibold tabular-nums">{formatRinggit(confirmation.totalSen)}</dd>
            </div>
          </dl>
        </section>
        <Link href="/" className="mt-5 inline-block font-semibold text-[#1d5b45] underline underline-offset-4">
          Back to menu
        </Link>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <header className="mb-6">
          <Link href="/cart" className="text-sm font-medium underline underline-offset-4">
            ← Back to cart
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Delivery details</h1>
        </header>
        <div className="rounded-2xl border border-dashed border-[#d8d0c3] bg-white px-4 py-10 text-center">
          <p>Your cart is empty. Add something from the menu before checkout.</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-[#1d5b45] underline underline-offset-4">
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  if (!isCartValid || total === null) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
        <header className="mb-6">
          <Link href="/cart" className="text-sm font-medium underline underline-offset-4">
            ← Back to cart
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Delivery details</h1>
        </header>
        <div
          role="alert"
          className="rounded-2xl border border-[#efc8b7] bg-[#fff0e5] p-4 text-[#8b3f22]"
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
          <Link href="/cart" className="mt-4 inline-block font-semibold text-[#1d5b45] underline underline-offset-4">
            Review your cart
          </Link>
        </div>
      </main>
    );
  }

  const selectedBatch = deliveryBatches.find((batch) => batch.id === values.batchId);
  const selectedBatchAvailability = selectedBatch
    ? getDeliveryBatchAvailability(selectedBatch, now)
    : null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
      <header className="mb-6">
        <Link href="/cart" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-[#1d5b45] hover:bg-[#f3efe7]">
          ← <span className="ml-2">Back to cart</span>
        </Link>
        <p className="mt-6 text-sm font-bold text-brand-orange">Almost there</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#143f31]">Delivery details</h1>
        <p className="mt-2 text-sm leading-6 text-[#627269]">
          Add your contact details and choose an available delivery batch.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <form id="checkout-details" onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <section className="rounded-3xl border border-[#e6dfd3] bg-white p-5 shadow-[0_10px_30px_rgba(20,63,49,0.06)] sm:p-7">
            <p className="text-sm font-bold text-brand-orange">Customer information</p>
            <h2 className="mt-1 text-xl font-black text-[#143f31]">Your details</h2>
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
                  <p id="full-name-error" className="mt-1 text-sm text-[#a94816]">
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
                  <p id="phone-number-error" className="mt-1 text-sm text-[#a94816]">
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
                  <p id="delivery-address-error" className="mt-1 text-sm text-[#a94816]">
                    {errors.address}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <fieldset
            aria-describedby={errors.batchId ? "batch-error" : undefined}
            className="rounded-3xl border border-[#e6dfd3] bg-white p-5 shadow-[0_10px_30px_rgba(20,63,49,0.06)] sm:p-7"
          >
            <legend className="px-1 text-lg font-black text-[#143f31]">Delivery batch</legend>
            <p className="mt-1 text-sm text-[#627269]">
              Delivery times and order cut-offs are awaiting restaurant confirmation.
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {deliveryBatches.map((batch) => {
                const availability = getDeliveryBatchAvailability(batch, now);
                const isSelected = values.batchId === batch.id;
                return (
                  <label
                    key={batch.id}
                    className={`flex min-h-16 items-center gap-3 rounded-2xl border p-4 ${
                      availability.available
                        ? "cursor-pointer border-[#c5d5cb] bg-[#fffdf9] hover:border-[#1d5b45] hover:bg-[#edf5ef]"
                        : "cursor-not-allowed border-[#e6dfd3] bg-[#f3efe7] text-[#819087]"
                    } ${isSelected ? "ring-2 ring-[#e87932]" : ""}`}
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
                      className="size-4 accent-[#1d5b45]"
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
              <p id="batch-error" role="alert" className="mt-2 text-sm text-[#a94816]">
                {errors.batchId}
              </p>
            ) : null}
          </fieldset>

          <button
            type="submit"
            disabled={!isCartValid}
            className="hidden min-h-12 rounded-xl bg-[#1d5b45] px-5 font-bold text-white hover:bg-[#143f31] disabled:cursor-not-allowed disabled:bg-[#e8e2d9] disabled:text-[#9a9f99] sm:flex sm:items-center sm:justify-center"
          >
            Review delivery details
          </button>

          {checkoutData ? (
            <div className="flex flex-col gap-3">
              <p
                role="status"
                className="rounded-xl border border-[#f1d0a6] bg-[#fff8e9] p-3 text-sm text-[#875a16]"
              >
                Review complete for {checkoutData.delivery.deliveryBatchLabel}. Your order has not
                been submitted yet.
              </p>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="min-h-12 rounded-xl bg-[#e87932] px-5 font-semibold text-white hover:bg-[#c85e1e] disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? "Submitting order…" : "Place order"}
              </button>
            </div>
          ) : null}
          {submissionError ? (
            <div
              role="alert"
              className="rounded-xl border border-[#efc8b7] bg-[#fff0e5] p-3 text-sm text-[#8b3f22]"
            >
              <p>{submissionError}</p>
              {isIdempotencyConflict ? (
                <p className="mt-2">
                  If you need to submit these changed details as a new order, review them and start a
                  new submission key.
                </p>
              ) : null}
              {isIdempotencyConflict ? (
                <button
                  type="button"
                  onClick={() => {
                    window.sessionStorage.removeItem(idempotencyStorageKey);
                    setSubmissionError("");
                    setIsIdempotencyConflict(false);
                  }}
                  className="mt-2 font-semibold underline underline-offset-4"
                >
                  Start a new submission
                </button>
              ) : null}
            </div>
          ) : null}
        </form>

        <aside className="h-fit rounded-3xl border border-border bg-surface p-5 shadow-panel sm:p-6 lg:sticky lg:top-24">
          <p className="text-sm font-bold text-brand-orange">Order summary</p>
          <h2 className="mt-1 text-xl font-black text-[#143f31]">Your order</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {cartLines.map(({ item, quantity, lineTotalSen }) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0">
                  {item.name} <span className="text-[#819087]">× {quantity}</span>
                </span>
                <span className="shrink-0 tabular-nums">{formatRinggit(lineTotalSen)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t border-[#e6dfd3] pt-4 tabular-nums">
            <div className="flex justify-between">
              <dt>Food subtotal</dt>
              <dd>{formatRinggit(total.subtotalSen)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery fee</dt>
              <dd>{formatRinggit(total.deliveryFeeSen)}</dd>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#1d5b45]">
              <dt>Total</dt>
              <dd>{formatRinggit(total.totalSen)}</dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-[#e6dfd3] pt-4 text-sm">
            <h3 className="font-semibold">Delivery review</h3>
            <dl className="mt-2 flex flex-col gap-2">
              <div>
                <dt className="text-[#819087]">Batch</dt>
                <dd>
                  {selectedBatch && selectedBatchAvailability?.available
                    ? selectedBatch.label
                    : "Choose an available batch"}
                </dd>
              </div>
              <div>
                <dt className="text-[#819087]">Address</dt>
                <dd className="break-words">{values.address.trim() || "Enter your address above"}</dd>
              </div>
              <div>
                <dt className="text-[#819087]">Contact</dt>
                <dd className="break-words">
                  {values.fullName.trim() || "Enter your name above"}
                  {values.phoneNumber.trim() ? ` · ${values.phoneNumber.trim()}` : ""}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
      {!checkoutData ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          <button
            type="submit"
            form="checkout-details"
            disabled={!isCartValid}
            aria-label="Review delivery details on mobile"
            className="mx-auto flex min-h-12 w-full max-w-md items-center justify-center rounded-xl bg-brand-green px-5 font-bold text-white shadow-card disabled:bg-[#e8e2d9] disabled:text-[#9a9f99]"
          >
            Review delivery details
          </button>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            aria-label="Place order on mobile"
            className="mx-auto flex min-h-12 w-full max-w-md items-center justify-center rounded-xl bg-brand-orange px-5 font-bold text-white shadow-card disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Submitting order…" : "Place order"}
          </button>
        </div>
      )}
    </main>
  );
}
