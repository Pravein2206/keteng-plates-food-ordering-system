import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MenuError from "./error";

// AC3: a failed load shows a clear message and a way to retry, not a blank page.
describe("menu error page", () => {
  test("shows a clear error message", () => {
    render(<MenuError error={new Error("test failure")} retry={() => {}} />);
    expect(screen.getByRole("alert").textContent).toContain("We couldn't load the menu.");
  });

  test("Try again asks Next.js to reload the menu", () => {
    const retry = vi.fn();
    render(<MenuError error={new Error("test failure")} retry={retry} />);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
