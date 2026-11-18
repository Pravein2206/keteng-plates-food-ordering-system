import {
  DELIVERY_BATCHES,
  getDeliveryBatchAvailability,
  type DeliveryBatchConfig,
  type DeliveryBatchId,
} from "./delivery-batches";

export type DeliveryFormValues = {
  fullName: string;
  phoneNumber: string;
  address: string;
  batchId: string;
};

export type DeliveryDetails = {
  fullName: string;
  phoneNumber: string;
  address: string;
  deliveryBatchId: DeliveryBatchId;
  deliveryBatchLabel: string;
};

export type DeliveryFieldErrors = Partial<Record<keyof DeliveryFormValues, string>>;
export type DeliveryValidationResult =
  | { valid: true; details: DeliveryDetails }
  | { valid: false; errors: DeliveryFieldErrors };

export function normalizeMalaysiaPhoneNumber(value: string): string | null {
  const input = value.trim();
  if (!input || !/^\+?[\d\s().-]+$/.test(input)) return null;

  let digits = input.replace(/[\s().-]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("60")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);

  const isMobile = /^1\d{8,9}$/.test(digits);
  const isLandline = /^[3-9]\d{7,8}$/.test(digits);
  return isMobile || isLandline ? `+60${digits}` : null;
}

export function validateDeliveryDetails(
  values: DeliveryFormValues,
  now: Date = new Date(),
  batches: readonly DeliveryBatchConfig[] = DELIVERY_BATCHES,
): DeliveryValidationResult {
  const errors: DeliveryFieldErrors = {};
  const fullName = values.fullName.trim();
  const address = values.address.trim();
  const phoneNumber = normalizeMalaysiaPhoneNumber(values.phoneNumber);

  if (!fullName) errors.fullName = "Enter your full name.";
  if (!phoneNumber) errors.phoneNumber = "Enter a valid Malaysian phone number.";
  if (!address) errors.address = "Enter your delivery address.";

  const batch = batches.find((candidate) => candidate.id === values.batchId);
  if (!batch) {
    errors.batchId = "Choose an available delivery batch.";
  } else {
    const availability = getDeliveryBatchAvailability(batch, now);
    if (!availability.available) {
      errors.batchId =
        availability.reason === "expired"
          ? "This delivery batch has closed. Choose another batch."
          : availability.reason === "invalid_schedule"
            ? "This delivery batch is unavailable because its schedule needs review."
            : "This delivery batch is unavailable. Choose another batch.";
    }
  }

  if (Object.keys(errors).length > 0 || !batch || !phoneNumber) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    details: {
      fullName,
      phoneNumber,
      address,
      deliveryBatchId: batch.id,
      deliveryBatchLabel: batch.label,
    },
  };
}
