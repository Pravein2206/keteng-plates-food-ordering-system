// Smoke test: proves React Testing Library can render our pages.
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

test("home page shows the Keteng Plates heading", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1, name: "Keteng Plates" })).toBeDefined();
});
