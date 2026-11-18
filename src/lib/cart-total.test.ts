import { describe, expect, test } from "vitest";
import {
  calculateCartTotal,
  CartTotalError,
  DELIVERY_FEE_SEN,
  isValidQuantity,
  lineTotalSen,
} from "./cart-total";

describe("calculateCartTotal", () => {
  // AC2: the example from the story.
  test("RM15 + RM8 + RM2 delivery = RM25", () => {
    expect(
      calculateCartTotal([
        { priceSen: 1500, quantity: 1 },
        { priceSen: 800, quantity: 1 },
      ]),
    ).toEqual({ subtotalSen: 2300, deliveryFeeSen: 200, totalSen: 2500 });
  });

  test("multiplies price by quantity for each line", () => {
    const total = calculateCartTotal([
      { priceSen: 800, quantity: 3 }, // RM24.00
      { priceSen: 1490, quantity: 2 }, // RM29.80
      { priceSen: 150, quantity: 1 }, // RM1.50
    ]);
    expect(total.subtotalSen).toBe(5530);
    expect(total.totalSen).toBe(5730);
  });

  test("charges the RM2 delivery fee exactly once, however many items", () => {
    const one = calculateCartTotal([{ priceSen: 100, quantity: 1 }]);
    const many = calculateCartTotal([
      { priceSen: 100, quantity: 10 },
      { priceSen: 200, quantity: 5 },
      { priceSen: 300, quantity: 1 },
    ]);
    expect(DELIVERY_FEE_SEN).toBe(200);
    expect(one.deliveryFeeSen).toBe(200);
    expect(many.deliveryFeeSen).toBe(200);
    expect(many.totalSen - many.subtotalSen).toBe(200);
  });

  test("works in whole sen with no floating-point drift", () => {
    // 0.1 + 0.2 style errors cannot happen with integer sen.
    const total = calculateCartTotal([
      { priceSen: 10, quantity: 1 },
      { priceSen: 20, quantity: 1 },
    ]);
    expect(total.subtotalSen).toBe(30);
  });

  // AC3: an empty cart cannot be totalled for checkout.
  test("rejects an empty cart", () => {
    expect(() => calculateCartTotal([])).toThrow(CartTotalError);
  });

  // AC3: zero or invalid quantities are rejected.
  test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects quantity %s",
    (quantity) => {
      expect(() => calculateCartTotal([{ priceSen: 800, quantity }])).toThrow(CartTotalError);
    },
  );

  test.each([0, -100, 8.5])("rejects price %s", (priceSen) => {
    expect(() => calculateCartTotal([{ priceSen, quantity: 1 }])).toThrow(CartTotalError);
  });
});

describe("lineTotalSen", () => {
  test("is price x quantity", () => {
    expect(lineTotalSen({ priceSen: 550, quantity: 4 })).toBe(2200);
  });
});

describe("isValidQuantity", () => {
  test("accepts whole numbers from 1", () => {
    expect(isValidQuantity(1)).toBe(true);
    expect(isValidQuantity(25)).toBe(true);
  });

  test("rejects zero, negatives and decimals", () => {
    expect(isValidQuantity(0)).toBe(false);
    expect(isValidQuantity(-2)).toBe(false);
    expect(isValidQuantity(2.5)).toBe(false);
  });
});
