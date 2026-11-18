import { describe, expect, test, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DeliveryBatchLoadError, getDeliveryBatches } from "./delivery-batch-store";

function makeClient(result: { data: unknown; error: unknown }) {
  const order = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ order });
  const from = vi.fn().mockReturnValue({ select });
  return {
    client: { from } as unknown as SupabaseClient,
    from,
    select,
    order,
  };
}

describe("getDeliveryBatches", () => {
  test("loads configured labels and Malaysia-local cutoff values from the database", async () => {
    const { client, from, select, order } = makeClient({
      data: [
        {
          id: "lunch-1",
          label: "Lunch service",
          sort_order: 1,
          enabled: true,
          cutoff_date: "2026-11-18",
          cutoff_time: "08:30:00",
        },
      ],
      error: null,
    });

    await expect(getDeliveryBatches(client)).resolves.toEqual([
      {
        id: "lunch-1",
        label: "Lunch service",
        enabled: true,
        cutoff: { date: "2026-11-18", time: "08:30" },
      },
    ]);
    expect(from).toHaveBeenCalledWith("delivery_batches");
    expect(select).toHaveBeenCalledWith("id, label, sort_order, enabled, cutoff_date, cutoff_time");
    expect(order).toHaveBeenCalledWith("sort_order", { ascending: true });
  });

  test("reports a database error instead of silently using stale batch settings", async () => {
    const { client } = makeClient({ data: null, error: new Error("Missing table") });
    await expect(getDeliveryBatches(client)).rejects.toBeInstanceOf(DeliveryBatchLoadError);
  });
});
