import { describe, expect, test, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  OrderSubmissionValidationError,
  OrderPersistenceError,
  submitOrder,
  type OrderStore,
} from "@/lib/order-submission";
import { DELIVERY_BATCHES, type DeliveryBatchConfig } from "@/lib/delivery-batches";
import { createSupabaseOrderStore } from "@/lib/supabase/order-store";
import type { CheckoutData } from "@/types/checkout";

const now = new Date("2026-11-18T00:00:00.000Z");
const key = "0d4e4c04-9e0a-4a2d-8fe4-ef49ac7b7f04";
const request = {
  items: [{ itemId: 7, quantity: 2 }],
  delivery: {
    fullName: "Test Customer",
    phoneNumber: "012-345 6789",
    address: "12 Test Street, Kuala Lumpur",
    deliveryBatchId: "lunch-1",
    deliveryBatchLabel: "untrusted label",
  },
};

describe("submitOrder", () => {
  test("normalizes delivery details and returns confirmation only after persistence succeeds", async () => {
    const persisted: CheckoutData[] = [];
    const batches: DeliveryBatchConfig[] = DELIVERY_BATCHES.map((batch) => ({
      ...batch,
      label: batch.id === "lunch-1" ? "Lunch service" : batch.label,
    }));
    const store: OrderStore = {
      async submit(_key, order) {
        persisted.push(order);
        return { reference: "KP-TEST-REFERENCE", totalSen: 3200, duplicate: false };
      },
    };

    await expect(submitOrder(request, key, store, now, batches)).resolves.toEqual({
      reference: "KP-TEST-REFERENCE",
      totalSen: 3200,
      duplicate: false,
    });
    expect(persisted[0].delivery.deliveryBatchLabel).toBe("Lunch service");
    expect(persisted[0].delivery.phoneNumber).toBe("+60123456789");
  });

  test("rejects a closed batch on the server before persistence", async () => {
    const batches: DeliveryBatchConfig[] = DELIVERY_BATCHES.map((batch) =>
      batch.id === "lunch-1"
        ? { ...batch, cutoff: { date: "2026-11-18", time: "08:00" } }
        : batch,
    );
    const submit = vi.fn();

    await expect(
      submitOrder(request, key, { submit }, now, batches),
    ).rejects.toBeInstanceOf(OrderSubmissionValidationError);
    expect(submit).not.toHaveBeenCalled();
  });

  test("rejects a batch that closes after server validation but before the database write", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Delivery batch has closed" },
    });
    const store = createSupabaseOrderStore({ rpc } as unknown as SupabaseClient);

    await expect(
      submitOrder(request, key, store, now, DELIVERY_BATCHES),
    ).rejects.toThrow("This delivery batch has closed");
  });

  test("rejects failed persistence instead of returning a confirmation", async () => {
    const store: OrderStore = {
      async submit() {
        throw new OrderPersistenceError();
      },
    };

    await expect(submitOrder(request, key, store, now, DELIVERY_BATCHES)).rejects.toBeInstanceOf(
      OrderPersistenceError,
    );
  });

  test("returns the original reference for a duplicate idempotency key", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ outcome: "created", order_reference: "KP-SAME-REFERENCE", total_sen: 3200 }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ outcome: "duplicate", order_reference: "KP-SAME-REFERENCE", total_sen: 3200 }],
        error: null,
      });
    const store = createSupabaseOrderStore({ rpc } as unknown as SupabaseClient);

    const first = await submitOrder(request, key, store, now, DELIVERY_BATCHES);
    const retry = await submitOrder(request, key, store, now, DELIVERY_BATCHES);

    expect(first.reference).toBe(retry.reference);
    expect(retry.duplicate).toBe(true);
    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc.mock.calls[0][1]).toEqual(rpc.mock.calls[1][1]);
  });

  test("rejects invalid quantities before persistence", async () => {
    const submit = vi.fn();
    const invalidRequest = {
      ...request,
      items: [{ itemId: 7, quantity: 0 }],
    };

    await expect(
      submitOrder(invalidRequest, key, { submit }, now, DELIVERY_BATCHES),
    ).rejects.toThrow("invalid item or quantity");
    expect(submit).not.toHaveBeenCalled();
  });
});
