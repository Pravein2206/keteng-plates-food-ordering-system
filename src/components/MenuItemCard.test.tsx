import { describe, expect, test } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { makeItem } from "@/test/menu-fixtures";
import { renderWithCart } from "@/test/render-with-cart";
import type { MenuItem } from "@/types/menu";
import { MenuItemCard } from "./MenuItemCard";

// Fake test data only.
const available = makeItem({ id: 1, code: "T1", name: "Test Rice Set", priceSen: 1490 });
const soldOut = makeItem({ id: 2, code: "T2", name: "Test Noodles", isAvailable: false });

function renderCard(item: MenuItem) {
  return renderWithCart(
    <ul>
      <MenuItemCard item={item} />
    </ul>,
  );
}

describe("MenuItemCard", () => {
  // US01 AC1: name, price and availability are visible.
  test("shows the code, name and price in RM", () => {
    renderCard(available);
    expect(screen.getByText("T1")).toBeDefined();
    expect(screen.getByText("Test Rice Set")).toBeDefined();
    expect(screen.getByText("RM14.90")).toBeDefined();
  });

  test("does not show 'Sold out' for an available item", () => {
    renderCard(available);
    expect(screen.queryByText("Sold out")).toBeNull();
  });

  // US01 AC2: sold-out items say "Sold out" and cannot be added.
  test("shows 'Sold out' for an unavailable item", () => {
    renderCard(soldOut);
    expect(screen.getByText("Sold out")).toBeDefined();
    expect(screen.getByText("Test Noodles")).toBeDefined();
  });

  test("a sold-out item has no button to add it", () => {
    renderCard(soldOut);
    expect(screen.queryByRole("button")).toBeNull();
  });

  // US02 AC1: add an available item and change its quantity.
  test("an available item has an Add button", () => {
    renderCard(available);
    expect(screen.getByRole("button", { name: "Add Test Rice Set to cart" })).toBeDefined();
  });

  test("Add turns into a quantity stepper that goes up and down", () => {
    renderCard(available);

    fireEvent.click(screen.getByRole("button", { name: "Add Test Rice Set to cart" }));
    expect(screen.getByText("Quantity of Test Rice Set:").parentElement?.textContent).toContain("1");

    fireEvent.click(screen.getByRole("button", { name: "Increase Test Rice Set" }));
    expect(screen.getByText("Quantity of Test Rice Set:").parentElement?.textContent).toContain("2");

    fireEvent.click(screen.getByRole("button", { name: "Decrease Test Rice Set" }));
    expect(screen.getByText("Quantity of Test Rice Set:").parentElement?.textContent).toContain("1");
  });

  test("pressing − at 1 removes the item and shows Add again", () => {
    renderCard(available);
    fireEvent.click(screen.getByRole("button", { name: "Add Test Rice Set to cart" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Test Rice Set from cart" }));
    expect(screen.getByRole("button", { name: "Add Test Rice Set to cart" })).toBeDefined();
  });
});
