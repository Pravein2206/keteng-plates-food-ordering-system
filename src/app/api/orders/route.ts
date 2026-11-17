import { SupabaseConfigError } from "@/lib/supabase/env";
import { DeliveryBatchLoadError, getDeliveryBatches } from "@/lib/delivery-batch-store";
import { createSupabaseOrderStore } from "@/lib/supabase/order-store";
import {
  isIdempotencyKey,
  OrderIdempotencyConflictError,
  OrderPersistenceError,
  OrderSubmissionValidationError,
  submitOrder,
} from "@/lib/order-submission";
import { createClient } from "@/lib/supabase/server";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? "";
  if (!isIdempotencyKey(idempotencyKey)) {
    return Response.json({ error: "A valid idempotency key is required." }, { status: 400, headers: noStore });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The order request must contain valid JSON." }, { status: 400, headers: noStore });
  }

  try {
    const client = await createClient();
    const now = new Date();
    const batches = await getDeliveryBatches(client);
    const result = await submitOrder(
      body,
      idempotencyKey,
      createSupabaseOrderStore(client),
      now,
      batches,
    );
    return Response.json(result, { headers: noStore });
  } catch (error) {
    if (error instanceof OrderSubmissionValidationError) {
      return Response.json({ error: error.message }, { status: 400, headers: noStore });
    }
    if (error instanceof OrderIdempotencyConflictError) {
      return Response.json(
        { error: "This checkout key was already used with different order details." },
        { status: 409, headers: noStore },
      );
    }
    if (error instanceof SupabaseConfigError) {
      return Response.json(
        { error: "Order submission is unavailable because the database is not configured." },
        { status: 503, headers: noStore },
      );
    }
    if (error instanceof DeliveryBatchLoadError) {
      return Response.json(
        { error: "Order submission is unavailable because delivery batch settings could not be loaded." },
        { status: 503, headers: noStore },
      );
    }
    if (error instanceof OrderPersistenceError) {
      return Response.json(
        { error: "We could not confirm that your order was saved. Retry with the same checkout details." },
        { status: 503, headers: noStore },
      );
    }
    throw error;
  }
}
