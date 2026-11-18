export const MALAYSIA_TIME_ZONE = "Asia/Kuala_Lumpur";

// The migration seeds these initial values. Runtime settings come from the
// public delivery_batches table so orders and the UI use the same schedule.
export const DELIVERY_BATCHES = [
  { id: "lunch-1", label: "Lunch 1", enabled: true, cutoff: null },
  { id: "lunch-2", label: "Lunch 2", enabled: true, cutoff: null },
  { id: "dinner-1", label: "Dinner 1", enabled: true, cutoff: null },
  { id: "dinner-2", label: "Dinner 2", enabled: true, cutoff: null },
] as const;

export type DeliveryBatch = (typeof DELIVERY_BATCHES)[number];
export type DeliveryBatchId = DeliveryBatch["id"];
export type DeliveryBatchCutoff = {
  date: string;
  time: string;
};
export type DeliveryBatchConfig = {
  id: DeliveryBatchId;
  label: string;
  enabled: boolean;
  cutoff: DeliveryBatchCutoff | null;
};
export type DeliveryBatchAvailability = {
  available: boolean;
  reason: "available" | "disabled" | "expired" | "invalid_schedule";
};

function isValidCutoff(cutoff: DeliveryBatchCutoff): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cutoff.date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(cutoff.time)) {
    return false;
  }

  const parsedDate = new Date(`${cutoff.date}T00:00:00.000Z`);
  return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === cutoff.date;
}

function getMalaysiaLocalDateTime(now: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MALAYSIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)?.value ?? "";

  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

export function getDeliveryBatchAvailability(
  batch: DeliveryBatchConfig,
  now: Date = new Date(),
): DeliveryBatchAvailability {
  if (!batch.enabled) return { available: false, reason: "disabled" };
  if (batch.cutoff === null) return { available: true, reason: "available" };
  if (!isValidCutoff(batch.cutoff)) {
    return { available: false, reason: "invalid_schedule" };
  }

  const localNow = getMalaysiaLocalDateTime(now);
  const isBeforeCutoff =
    localNow.date < batch.cutoff.date ||
    (localNow.date === batch.cutoff.date && localNow.time < batch.cutoff.time);

  return isBeforeCutoff
    ? { available: true, reason: "available" }
    : { available: false, reason: "expired" };
}
