import { describe, expect, test } from "vitest";
import { DELIVERY_BATCHES, type DeliveryBatchConfig } from "./delivery-batches";
import { validateDeliveryDetails, type DeliveryFormValues } from "./delivery-details";

const validValues: DeliveryFormValues = {
  fullName: "  Nur Aisyah Ahmad  ",
  phoneNumber: "012-345 6789",
  address: "  12 Jalan Mawar, Kuala Lumpur  ",
  batchId: "lunch-1",
};

describe("validateDeliveryDetails", () => {
  test("returns trimmed customer details and a normalized Malaysian phone number", () => {
    expect(validateDeliveryDetails(validValues)).toEqual({
      valid: true,
      details: {
        fullName: "Nur Aisyah Ahmad",
        phoneNumber: "+60123456789",
        address: "12 Jalan Mawar, Kuala Lumpur",
        deliveryBatchId: "lunch-1",
        deliveryBatchLabel: "Lunch 1",
      },
    });
  });

  test("reports missing required fields", () => {
    const result = validateDeliveryDetails({
      ...validValues,
      fullName: "",
      phoneNumber: "",
      address: "",
      batchId: "",
    });

    expect(result).toEqual({
      valid: false,
      errors: {
        fullName: "Enter your full name.",
        phoneNumber: "Enter a valid Malaysian phone number.",
        address: "Enter your delivery address.",
        batchId: "Choose an available delivery batch.",
      },
    });
  });

  test.each(["123", "abcdefghij", "+1 212 555 0100", "012-abc-6789"])(
    "rejects an invalid Malaysian phone number: %s",
    (phoneNumber) => {
      const result = validateDeliveryDetails({ ...validValues, phoneNumber });

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.phoneNumber).toBe("Enter a valid Malaysian phone number.");
      }
    },
  );

  test("rejects whitespace-only names and addresses", () => {
    const result = validateDeliveryDetails({
      ...validValues,
      fullName: " \t ",
      address: " \n ",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.fullName).toBe("Enter your full name.");
      expect(result.errors.address).toBe("Enter your delivery address.");
    }
  });

  test("rejects a disabled or expired delivery batch", () => {
    const disabledBatch: DeliveryBatchConfig = {
      ...DELIVERY_BATCHES[0],
      enabled: false,
    };
    const expiredBatch: DeliveryBatchConfig = {
      ...DELIVERY_BATCHES[0],
      cutoff: { date: "2026-11-18", time: "12:00" },
    };

    const disabled = validateDeliveryDetails(validValues, new Date("2026-11-18T03:00:00Z"), [
      disabledBatch,
    ]);
    const expired = validateDeliveryDetails(validValues, new Date("2026-11-18T04:00:00Z"), [
      expiredBatch,
    ]);

    expect(disabled.valid).toBe(false);
    expect(expired.valid).toBe(false);
    if (!disabled.valid && !expired.valid) {
      expect(disabled.errors.batchId).toMatch(/unavailable/i);
      expect(expired.errors.batchId).toMatch(/closed/i);
    }
  });

  test("rejects an unknown batch id", () => {
    const result = validateDeliveryDetails({ ...validValues, batchId: "unknown" });

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.batchId).toBe("Choose an available delivery batch.");
  });
});
