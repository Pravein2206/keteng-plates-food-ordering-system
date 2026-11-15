import { beforeEach, describe, expect, test } from "vitest";
import { CART_MAX_AGE_MS, CART_STORAGE_KEY, loadCart, saveCart } from "./cart-storage";

const now = 1_000_000_000_000;

describe("cart storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("saves and loads the cart", () => {
    saveCart(localStorage, [{ itemId: 4, quantity: 2 }], now);
    expect(loadCart(localStorage, now + 1000)).toEqual([{ itemId: 4, quantity: 2 }]);
  });

  test("stores only item ids and quantities", () => {
    saveCart(localStorage, [{ itemId: 4, quantity: 2 }], now);
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual({
      savedAt: now,
      lines: [{ itemId: 4, quantity: 2 }],
    });
  });

  test("an empty cart removes the saved entry", () => {
    saveCart(localStorage, [{ itemId: 4, quantity: 2 }], now);
    saveCart(localStorage, [], now);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });

  test("keeps a cart that is up to 24 hours old", () => {
    saveCart(localStorage, [{ itemId: 4, quantity: 1 }], now);
    expect(loadCart(localStorage, now + CART_MAX_AGE_MS)).toHaveLength(1);
  });

  test("throws away a cart older than 24 hours", () => {
    saveCart(localStorage, [{ itemId: 4, quantity: 1 }], now);
    expect(loadCart(localStorage, now + CART_MAX_AGE_MS + 1)).toEqual([]);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });

  test("ignores damaged data", () => {
    localStorage.setItem(CART_STORAGE_KEY, "{not json");
    expect(loadCart(localStorage, now)).toEqual([]);
  });

  test("drops invalid lines and duplicates but keeps good ones", () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        savedAt: now,
        lines: [
          { itemId: 1, quantity: 2 },
          { itemId: 2, quantity: 0 },
          { itemId: 3, quantity: 1.5 },
          { itemId: "4", quantity: 1 },
          { itemId: 1, quantity: 9 },
          null,
        ],
      }),
    );
    expect(loadCart(localStorage, now)).toEqual([{ itemId: 1, quantity: 2 }]);
  });

  test("works without storage (blocked or unavailable)", () => {
    expect(loadCart(undefined, now)).toEqual([]);
    expect(() => saveCart(undefined, [{ itemId: 1, quantity: 1 }], now)).not.toThrow();
  });
});
