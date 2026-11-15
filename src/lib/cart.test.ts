import { describe, expect, test } from "vitest";
import {
  testAddOn,
  testDrink,
  testMain,
  testMain2,
  testMenuItems,
  testSoldOut,
} from "@/test/menu-fixtures";
import {
  addItem,
  buildCartLines,
  decreaseQuantity,
  getCheckoutProblems,
  quantityInCart,
  removeItem,
  type CartLine,
} from "./cart";

describe("cart quantity rules", () => {
  // AC1: add an available item and change its quantity.
  test("adding a new item puts 1 in the cart", () => {
    expect(addItem([], testMain)).toEqual([{ itemId: 1, quantity: 1 }]);
  });

  test("adding the same item again increases its quantity", () => {
    const cart = addItem(addItem([], testMain), testMain);
    expect(quantityInCart(cart, testMain.id)).toBe(2);
    expect(cart).toHaveLength(1);
  });

  test("decreasing lowers the quantity by one", () => {
    const cart: CartLine[] = [{ itemId: 1, quantity: 3 }];
    expect(decreaseQuantity(cart, 1)).toEqual([{ itemId: 1, quantity: 2 }]);
  });

  test("decreasing at quantity 1 removes the item (never 0 in the cart)", () => {
    const cart: CartLine[] = [
      { itemId: 1, quantity: 1 },
      { itemId: 2, quantity: 2 },
    ];
    expect(decreaseQuantity(cart, 1)).toEqual([{ itemId: 2, quantity: 2 }]);
  });

  test("remove takes the whole line out", () => {
    const cart: CartLine[] = [{ itemId: 1, quantity: 5 }];
    expect(removeItem(cart, 1)).toEqual([]);
  });

  test("does not change the original cart", () => {
    const cart: CartLine[] = [{ itemId: 1, quantity: 1 }];
    addItem(cart, testMain);
    decreaseQuantity(cart, 1);
    expect(cart).toEqual([{ itemId: 1, quantity: 1 }]);
  });

  // Business rule: sold-out items cannot be added.
  test("refuses to add a sold-out item", () => {
    const cart: CartLine[] = [];
    expect(addItem(cart, testSoldOut)).toBe(cart);
  });

  test("refuses to increase an item that has sold out since it was added", () => {
    const cart: CartLine[] = [{ itemId: testSoldOut.id, quantity: 1 }];
    expect(quantityInCart(addItem(cart, testSoldOut), testSoldOut.id)).toBe(1);
  });
});

describe("buildCartLines", () => {
  test("uses fresh menu prices and calculates each line total", () => {
    const lines = buildCartLines([{ itemId: 1, quantity: 2 }], testMenuItems);
    expect(lines).toEqual([{ item: testMain, quantity: 2, lineTotalSen: 3000 }]);
  });

  test("skips items that are no longer on the menu", () => {
    const lines = buildCartLines(
      [
        { itemId: 999, quantity: 1 },
        { itemId: 2, quantity: 1 },
      ],
      testMenuItems,
    );
    expect(lines.map((line) => line.item.id)).toEqual([2]);
  });
});

describe("getCheckoutProblems", () => {
  const linesFor = (...items: (typeof testMain)[]) =>
    buildCartLines(
      items.map((item) => ({ itemId: item.id, quantity: 1 })),
      testMenuItems,
    );

  // AC3: an empty cart cannot proceed.
  test("an empty cart cannot check out", () => {
    expect(getCheckoutProblems([])).toEqual(["empty"]);
  });

  test("main only is fine", () => {
    expect(getCheckoutProblems(linesFor(testMain))).toEqual([]);
  });

  test("main + add-on is fine", () => {
    expect(getCheckoutProblems(linesFor(testMain, testAddOn))).toEqual([]);
  });

  test("main + drink is fine", () => {
    expect(getCheckoutProblems(linesFor(testMain2, testDrink))).toEqual([]);
  });

  test("drinks only is fine", () => {
    expect(getCheckoutProblems(linesFor(testDrink))).toEqual([]);
  });

  test("add-ons only is blocked", () => {
    expect(getCheckoutProblems(linesFor(testAddOn))).toEqual(["add_on_without_main"]);
  });

  test("add-ons + drink with no main is blocked", () => {
    expect(getCheckoutProblems(linesFor(testAddOn, testDrink))).toEqual(["add_on_without_main"]);
  });

  test("a sold-out item in the cart blocks checkout", () => {
    expect(getCheckoutProblems(linesFor(testMain, testSoldOut))).toEqual(["sold_out"]);
  });
});
