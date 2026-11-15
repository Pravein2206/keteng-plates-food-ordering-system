import { describe, expect, test } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { saveCart } from "@/lib/cart-storage";
import {
  testAddOn,
  testDrink,
  testMain,
  testMain2,
  testMenuItems,
  testSoldOut,
} from "@/test/menu-fixtures";
import { renderWithCart } from "@/test/render-with-cart";
import { CartView } from "./CartView";

function startWith(lines: { itemId: number; quantity: number }[]) {
  saveCart(localStorage, lines);
  renderWithCart(<CartView menuItems={testMenuItems} />);
}

const checkoutButton = () => screen.getByRole("button", { name: "Continue to checkout" });
const totalRow = (label: string) => screen.getByText(label).nextElementSibling?.textContent;

describe("CartView", () => {
  // US02 AC3: an empty cart cannot proceed to checkout.
  test("empty cart shows a message and checkout is disabled", () => {
    startWith([]);
    expect(screen.getByText(/Your cart is empty/)).toBeDefined();
    expect(checkoutButton().hasAttribute("disabled")).toBe(true);
    expect(screen.queryByRole("link", { name: "Continue to checkout" })).toBeNull();
  });

  // US02 AC2: RM15 + RM8 + RM2 = RM25
  test("shows subtotal, RM2 delivery once, and total", () => {
    startWith([
      { itemId: testMain.id, quantity: 1 },
      { itemId: testMain2.id, quantity: 1 },
    ]);
    expect(totalRow("Subtotal")).toBe("RM23.00");
    expect(totalRow("Delivery fee")).toBe("RM2.00");
    expect(totalRow("Total")).toBe("RM25.00");
  });

  // US02 AC1: changing quantity updates the cart and totals.
  test("increasing a quantity updates the line and the total", () => {
    startWith([{ itemId: testMain2.id, quantity: 1 }]); // RM8
    fireEvent.click(screen.getByRole("button", { name: "Increase Test Noodles" }));
    expect(screen.getByText("2 × RM8.00")).toBeDefined();
    expect(totalRow("Total")).toBe("RM18.00");
  });

  test("decreasing the last one removes it and empties the cart", () => {
    startWith([{ itemId: testMain2.id, quantity: 1 }]);
    fireEvent.click(screen.getByRole("button", { name: "Remove Test Noodles from cart" }));
    expect(screen.getByText(/Your cart is empty/)).toBeDefined();
  });

  test("a valid cart links to checkout", () => {
    startWith([{ itemId: testMain.id, quantity: 1 }]);
    const link = screen.getByRole("link", { name: "Continue to checkout" });
    expect(link.getAttribute("href")).toBe("/checkout");
  });

  test("drinks only can check out", () => {
    startWith([{ itemId: testDrink.id, quantity: 2 }]);
    expect(screen.getByRole("link", { name: "Continue to checkout" })).toBeDefined();
  });

  test("an item that sold out after being added is flagged and blocks checkout", () => {
    startWith([
      { itemId: testMain.id, quantity: 1 },
      { itemId: testSoldOut.id, quantity: 1 },
    ]);
    expect(screen.getByText("Sold out, please remove")).toBeDefined();
    expect(screen.getByRole("alert").textContent).toContain("Some items have sold out");
    expect(checkoutButton().hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Remove Test Soup from cart" }));
    expect(screen.getByRole("link", { name: "Continue to checkout" })).toBeDefined();
  });

  test("add-ons with only a drink (no main) block checkout", () => {
    startWith([
      { itemId: testAddOn.id, quantity: 1 },
      { itemId: testDrink.id, quantity: 1 },
    ]);
    expect(screen.getByRole("alert").textContent).toContain(
      "Add-ons must be ordered with at least one main dish.",
    );
    expect(checkoutButton().hasAttribute("disabled")).toBe(true);
  });
});
