import type { SupabaseClient } from "@supabase/supabase-js";
import {
  OrderIdempotencyConflictError,
  OrderPersistenceError,
  OrderSubmissionValidationError,
  type OrderStore,
} from "@/lib/order-submission";

export function createSupabaseOrderStore(client: SupabaseClient): OrderStore {
  return {
    async submit(idempotencyKey, order) {
      const { data, error } = await client.rpc("submit_order", {
        p_idempotency_key: idempotencyKey,
        p_items: order.items.map(({ itemId, quantity }) => ({
          item_id: itemId,
          quantity,
        })),
        p_delivery: {
          fullName: order.delivery.fullName,
          phoneNumber: order.delivery.phoneNumber,
          address: order.delivery.address,
          deliveryBatchId: order.delivery.deliveryBatchId,
        },
      });

      if (error) {
        if (error.message === "Delivery batch has closed") {
          throw new OrderSubmissionValidationError(
            "This delivery batch has closed. Choose another available batch.",
          );
        }
        if (error.message === "Delivery batch is not available") {
          throw new OrderSubmissionValidationError(
            "This delivery batch is unavailable. Choose another available batch.",
          );
        }
        throw new OrderPersistenceError();
      }

      const row = Array.isArray(data) ? data[0] : null;
      if (!row || typeof row !== "object") throw new OrderPersistenceError();
      const result = row as {
        outcome?: unknown;
        order_reference?: unknown;
        total_sen?: unknown;
      };

      if (result.outcome === "conflict") throw new OrderIdempotencyConflictError();
      if (
        (result.outcome !== "created" && result.outcome !== "duplicate") ||
        typeof result.order_reference !== "string" ||
        typeof result.total_sen !== "number"
      ) {
        throw new OrderPersistenceError();
      }

      return {
        reference: result.order_reference,
        totalSen: result.total_sen,
        duplicate: result.outcome === "duplicate",
      };
    },
  };
}
