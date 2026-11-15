import { describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { saveCart } from "@/lib/cart-storage";
import { testMain, testMain2, testMenuItems } from "@/test/menu-fixtures";
import { renderWithCart } from "@/test/render-with-cart";
import { CartBar } from "./CartBar";

describe("CartBar", () => {
  test("is hidden when the cart is empty", () => {
    renderWithCart(<CartBar menuItems={testMenuItems} />);
    expect(screen.queryByRole("link", { name: /View cart/ })).toBeNull();
  });

  // US02 AC2: RM15 + RM8 + RM2 = RM25
  test("shows item count and total including RM2 delivery, linking to the cart", () => {
    saveCart(localStorage, [
      { itemId: testMain.id, quantity: 1 }, // RM15
      { itemId: testMain2.id, quantity: 1 }, // RM8
    ]);
    renderWithCart(<CartBar menuItems={testMenuItems} />);

    const link = screen.getByRole("link", { name: /View cart/ });
    expect(link.textContent).toContain("2 items · RM25.00");
    expect(link.getAttribute("href")).toBe("/cart");
  });

  test("counts quantities, not just lines", () => {
    saveCart(localStorage, [{ itemId: testMain2.id, quantity: 3 }]);
    renderWithCart(<CartBar menuItems={testMenuItems} />);
    expect(screen.getByRole("link", { name: /View cart/ }).textContent).toContain("3 items · RM26.00");
  });
});
