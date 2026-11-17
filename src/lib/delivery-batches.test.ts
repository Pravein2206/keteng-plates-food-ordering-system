import { describe, expect, test } from "vitest";
import {
  DELIVERY_BATCHES,
  getDeliveryBatchAvailability,
  type DeliveryBatchConfig,
} from "./delivery-batches";

describe("delivery batch availability", () => {
  test("provides four open batches while restaurant schedules are unconfigured", () => {
    expect(DELIVERY_BATCHES).toHaveLength(4);
    expect(DELIVERY_BATCHES.every((batch) => getDeliveryBatchAvailability(batch).available)).toBe(
      true,
    );
  });

  test("marks a disabled batch unavailable", () => {
    const batch: DeliveryBatchConfig = {
      ...DELIVERY_BATCHES[0],
      enabled: false,
    };

    expect(getDeliveryBatchAvailability(batch).reason).toBe("disabled");
  });

  test("closes a configured batch at the exact Kuala Lumpur cutoff boundary", () => {
    const batch: DeliveryBatchConfig = {
      ...DELIVERY_BATCHES[0],
      cutoff: { date: "2026-11-18", time: "12:00" },
    };

    expect(getDeliveryBatchAvailability(batch, new Date("2026-11-18T03:59:00Z")).available).toBe(
      true,
    );
    expect(getDeliveryBatchAvailability(batch, new Date("2026-11-18T04:00:00Z"))).toEqual({
      available: false,
      reason: "expired",
    });
    expect(getDeliveryBatchAvailability(batch, new Date("2026-11-18T04:01:00Z")).available).toBe(
      false,
    );
  });

  test("uses the Malaysia date when UTC has not reached midnight", () => {
    const batch: DeliveryBatchConfig = {
      ...DELIVERY_BATCHES[0],
      cutoff: { date: "2026-11-18", time: "00:15" },
    };

    expect(getDeliveryBatchAvailability(batch, new Date("2026-11-17T16:14:00Z")).available).toBe(
      true,
    );
    expect(getDeliveryBatchAvailability(batch, new Date("2026-11-17T16:15:00Z")).reason).toBe(
      "expired",
    );
  });

  test("fails closed for an invalid configured cutoff", () => {
    const batch: DeliveryBatchConfig = {
      ...DELIVERY_BATCHES[0],
      cutoff: { date: "2026-02-31", time: "12:00" },
    };

    expect(getDeliveryBatchAvailability(batch).reason).toBe("invalid_schedule");
  });
});
