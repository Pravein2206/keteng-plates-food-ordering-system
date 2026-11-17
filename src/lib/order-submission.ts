import { validateDeliveryDetails } from "@/lib/delivery-details";
import type { DeliveryBatchConfig } from "@/lib/delivery-batches";
import type { CheckoutData } from "@/types/checkout";
import type { CartLine } from "./cart";

export type PersistedOrder = {
  reference: string;
  totalSen: number;
  duplicate: boolean;
};

export type OrderStore = {
  submit: (idempotencyKey: string, order: CheckoutData) => Promise<PersistedOrder>;
};

export class OrderSubmissionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderSubmissionValidationError";
  }
}

export class OrderIdempotencyConflictError extends Error {
  constructor() {
    super("This checkout key was already used with different order details.");
    this.name = "OrderIdempotencyConflictError";
  }
}

export class OrderPersistenceError extends Error {
  constructor() {
    super("The order could not be saved.");
    this.name = "OrderPersistenceError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseCheckoutData(
  value: unknown,
  now: Date,
  batches: readonly DeliveryBatchConfig[],
): CheckoutData {
  if (!isRecord(value) || !Array.isArray(value.items) || value.items.length === 0 || !isRecord(value.delivery)) {
    throw new OrderSubmissionValidationError("Your cart or delivery details are invalid.");
  }

  const seenItemIds = new Set<number>();
  const items: CartLine[] = [];

  for (const candidate of value.items) {
    const itemId = isRecord(candidate) ? candidate.itemId : null;
    const quantity = isRecord(candidate) ? candidate.quantity : null;
    if (
      typeof itemId !== "number" ||
      !Number.isSafeInteger(itemId) ||
      itemId < 1 ||
      typeof quantity !== "number" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 2_147_483_647
    ) {
      throw new OrderSubmissionValidationError("Your cart contains an invalid item or quantity.");
    }

    if (seenItemIds.has(itemId)) {
      throw new OrderSubmissionValidationError("Your cart contains a duplicate item.");
    }
    seenItemIds.add(itemId);
    items.push({ itemId, quantity });
  }

  const { fullName, phoneNumber, address, deliveryBatchId } = value.delivery;
  if (
    typeof fullName !== "string" ||
    typeof phoneNumber !== "string" ||
    typeof address !== "string" ||
    typeof deliveryBatchId !== "string"
  ) {
    throw new OrderSubmissionValidationError("Your delivery details are invalid.");
  }

  const validation = validateDeliveryDetails(
    { fullName, phoneNumber, address, batchId: deliveryBatchId },
    now,
    batches,
  );
  if (!validation.valid) {
    throw new OrderSubmissionValidationError("Check your name, phone, address, and delivery batch.");
  }

  return { items, delivery: validation.details };
}

export async function submitOrder(
  value: unknown,
  idempotencyKey: string,
  store: OrderStore,
  now: Date,
  batches: readonly DeliveryBatchConfig[],
): Promise<PersistedOrder> {
  const order = parseCheckoutData(value, now, batches);
  const result = await store.submit(idempotencyKey, order);
  if (!result.reference || !Number.isSafeInteger(result.totalSen) || result.totalSen < 1) {
    throw new OrderPersistenceError();
  }
  return result;
}

export function isIdempotencyKey(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
