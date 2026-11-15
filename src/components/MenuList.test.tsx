import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { MenuCategory } from "@/types/menu";
import { MenuList } from "./MenuList";

// Fake test data only.
const categories: MenuCategory[] = [
  {
    id: 1,
    name: "Test Mains",
    kind: "main",
    items: [
      { id: 10, code: "T1", name: "Test Rice Set", priceSen: 800, isAvailable: true, categoryKind: "main" },
      { id: 11, code: "T2", name: "Test Noodles", priceSen: 900, isAvailable: false, categoryKind: "main" },
    ],
  },
  {
    id: 2,
    name: "Test Drinks",
    kind: "drink",
    items: [{ id: 20, code: "D1", name: "Test Tea", priceSen: 100, isAvailable: true, categoryKind: "drink" }],
  },
];

describe("MenuList", () => {
  test("shows each section heading with its items in order", () => {
    render(<MenuList categories={categories} />);

    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(["Test Mains", "Test Drinks"]);

    const mains = screen.getByRole("region", { name: "Test Mains" });
    const names = within(mains)
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    expect(names[0]).toContain("Test Rice Set");
    expect(names[1]).toContain("Test Noodles");
  });

  test("marks only the sold-out item as 'Sold out'", () => {
    render(<MenuList categories={categories} />);
    const soldOutLabels = screen.getAllByText("Sold out");
    expect(soldOutLabels).toHaveLength(1);
    expect(soldOutLabels[0].closest("li")?.textContent).toContain("Test Noodles");
  });

  test("shows an empty message when there are no items", () => {
    render(<MenuList categories={[]} />);
    expect(screen.getByText(/No items on the menu right now/)).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
