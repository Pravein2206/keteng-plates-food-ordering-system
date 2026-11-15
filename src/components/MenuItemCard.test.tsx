import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MenuItem } from "@/types/menu";
import { MenuItemCard } from "./MenuItemCard";

// Fake test data only.
const available: MenuItem = {
  id: 1,
  code: "T1",
  name: "Test Rice Set",
  priceSen: 1490,
  isAvailable: true,
  categoryKind: "main",
};
const soldOut: MenuItem = { ...available, id: 2, code: "T2", name: "Test Noodles", isAvailable: false };

function renderCard(item: MenuItem) {
  return render(
    <ul>
      <MenuItemCard item={item} />
    </ul>,
  );
}

describe("MenuItemCard", () => {
  // AC1: name, price and availability are visible.
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

  // AC2: sold-out items say "Sold out" and cannot be added.
  test("shows 'Sold out' for an unavailable item", () => {
    renderCard(soldOut);
    expect(screen.getByText("Sold out")).toBeDefined();
    expect(screen.getByText("Test Noodles")).toBeDefined();
  });

  test("a sold-out item has no button to add it", () => {
    renderCard(soldOut);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
