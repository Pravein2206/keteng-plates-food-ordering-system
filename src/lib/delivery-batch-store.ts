import type { SupabaseClient } from "@supabase/supabase-js";
import { DELIVERY_BATCHES, type DeliveryBatchConfig, type DeliveryBatchCutoff } from "./delivery-batches";

type DeliveryBatchRow = {
  id: string;
  label: string;
  sort_order: number;
  enabled: boolean;
  cutoff_date: string | null;
  cutoff_time: string | null;
};

export class DeliveryBatchLoadError extends Error {
  constructor() {
    super("Could not load delivery batch settings.");
    this.name = "DeliveryBatchLoadError";
  }
}

export async function getDeliveryBatches(client: SupabaseClient): Promise<DeliveryBatchConfig[]> {
  const { data, error } = await client
    .from("delivery_batches")
    .select("id, label, sort_order, enabled, cutoff_date, cutoff_time")
    .order("sort_order", { ascending: true });

  if (error) throw new DeliveryBatchLoadError();

  return ((data ?? []) as DeliveryBatchRow[]).map((row) => {
    const isKnownBatch = DELIVERY_BATCHES.some((batch) => batch.id === row.id);
    if (!isKnownBatch || !row.label.trim() || typeof row.enabled !== "boolean") {
      throw new DeliveryBatchLoadError();
    }

    let cutoff: DeliveryBatchCutoff | null = null;
    if (row.cutoff_date !== null || row.cutoff_time !== null) {
      if (typeof row.cutoff_date !== "string" || typeof row.cutoff_time !== "string") {
        throw new DeliveryBatchLoadError();
      }
      cutoff = { date: row.cutoff_date, time: row.cutoff_time.slice(0, 5) };
    }

    return {
      id: row.id as DeliveryBatchConfig["id"],
      label: row.label,
      enabled: row.enabled,
      cutoff,
    };
  });
}
