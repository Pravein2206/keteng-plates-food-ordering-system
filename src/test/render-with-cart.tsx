// Renders a component inside a fresh CartProvider, like the real app does.
// Put lines in localStorage first (with saveCart) to start with items in the cart.
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { CartProvider } from "@/components/CartProvider";

export function renderWithCart(ui: ReactElement) {
  return render(<CartProvider>{ui}</CartProvider>);
}
