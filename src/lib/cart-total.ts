// The ONE place where cart money is calculated. All amounts are whole sen.
// This total is for display. When an order is saved (US04), the server must
// recalculate it from database prices and never trust a total from the browser.

// Flat delivery fee, charged once per delivery order (RM2.00).
export const DELIVERY_FEE_SEN = 200;

export type PricedLine = {
  priceSen: number;
  quantity: number;
};

export type CartTotal = {
  subtotalSen: number;
  deliveryFeeSen: number;
  totalSen: number;
};

export class CartTotalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartTotalError";
  }
}

// A valid quantity is a whole number of at least 1. (No upper limit yet:
// waiting for the owner, see issue #19.)
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1;
}

export function lineTotalSen({ priceSen, quantity }: PricedLine): number {
  if (!Number.isInteger(priceSen) || priceSen <= 0) {
    throw new CartTotalError(`Price must be a positive whole number of sen. Got: ${priceSen}`);
  }
  if (!isValidQuantity(quantity)) {
    throw new CartTotalError(`Quantity must be a whole number of at least 1. Got: ${quantity}`);
  }
  return priceSen * quantity;
}

// Total = sum(price x quantity) + delivery fee (added once).
export function calculateCartTotal(lines: PricedLine[]): CartTotal {
  if (lines.length === 0) {
    throw new CartTotalError("Cannot total an empty cart.");
  }
  const subtotalSen = lines.reduce((sum, line) => sum + lineTotalSen(line), 0);
  return {
    subtotalSen,
    deliveryFeeSen: DELIVERY_FEE_SEN,
    totalSen: subtotalSen + DELIVERY_FEE_SEN,
  };
}
