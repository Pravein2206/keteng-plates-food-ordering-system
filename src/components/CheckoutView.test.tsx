import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { CartView } from "@/components/CartView";
import { saveCart, loadCart } from "@/lib/cart-storage";
import { DELIVERY_BATCHES } from "@/lib/delivery-batches";
import { testMain, testMain2, testMenuItems, testSoldOut } from "@/test/menu-fixtures";
import { renderWithCart } from "@/test/render-with-cart";
import { CheckoutView } from "./CheckoutView";

const initialNow = "2026-11-18T00:00:00.000Z";

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function startWith(lines: { itemId: number; quantity: number }[]) {
  saveCart(localStorage, lines);
  return renderWithCart(
    <CheckoutView
      menuItems={testMenuItems}
      deliveryBatches={DELIVERY_BATCHES}
      initialNow={initialNow}
    />,
  );
}

describe("CheckoutView", () => {
  test("blocks an empty cart and links back to the menu", () => {
    startWith([]);

    expect(screen.getByText(/Your cart is empty/)).toBeDefined();
    expect(screen.queryByRole("form")).toBeNull();
    expect(screen.getByRole("link", { name: "Back to menu" }).getAttribute("href")).toBe("/");
  });

  test("shows the cart subtotal, one delivery fee, total, and all four batches", () => {
    startWith([
      { itemId: testMain.id, quantity: 1 },
      { itemId: testMain2.id, quantity: 1 },
    ]);

    const totalRow = (label: string) => screen.getByText(label).nextElementSibling?.textContent;
    expect(totalRow("Food subtotal")).toBe("RM23.00");
    expect(totalRow("Delivery fee")).toBe("RM2.00");
    expect(totalRow("Total")).toBe("RM25.00");
    expect(screen.getByRole("radio", { name: /Lunch 1/ })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Lunch 2/ })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Dinner 1/ })).toBeDefined();
    expect(screen.getByRole("radio", { name: /Dinner 2/ })).toBeDefined();
  });

  test("shows required-field errors and does not create checkout data", () => {
    startWith([{ itemId: testMain.id, quantity: 1 }]);
    fireEvent.click(screen.getByRole("radio", { name: /Lunch 1/ }));
    fireEvent.click(screen.getByRole("button", { name: "Review delivery details" }));

    expect(screen.getByText("Enter your full name.")).toBeDefined();
    expect(screen.getByText("Enter a valid Malaysian phone number.")).toBeDefined();
    expect(screen.getByText("Enter your delivery address.")).toBeDefined();
    expect(screen.queryByRole("status")).toBeNull();
  });

  test("validates delivery details and waits for an explicit order submission", () => {
    startWith([{ itemId: testMain.id, quantity: 1 }]);
    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Nur Aisyah Ahmad" },
    });
    fireEvent.change(screen.getByLabelText("Malaysian phone number"), {
      target: { value: "012-345 6789" },
    });
    fireEvent.change(screen.getByLabelText("Delivery address"), {
      target: { value: "12 Jalan Mawar, Kuala Lumpur" },
    });
    fireEvent.click(screen.getByRole("radio", { name: /Lunch 1/ }));
    fireEvent.click(screen.getByRole("button", { name: "Review delivery details" }));

    expect(screen.getByRole("status").textContent).toContain("Your order has not been submitted yet.");
    expect(screen.getByRole("button", { name: "Place order" })).toBeDefined();
    expect(screen.getByLabelText<HTMLTextAreaElement>("Delivery address").value).toBe(
      "12 Jalan Mawar, Kuala Lumpur",
    );
    expect(screen.getAllByText("Lunch 1").length).toBeGreaterThan(0);
  });

  test("confirms only after persistence succeeds and reuses the same key on retry", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json(
          { error: "We could not confirm that your order was saved." },
          { status: 503 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json(
          { reference: "KP-SAVED-REFERENCE", totalSen: 1700, duplicate: true },
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetch);
    startWith([{ itemId: testMain.id, quantity: 1 }]);

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Test Customer" },
    });
    fireEvent.change(screen.getByLabelText("Malaysian phone number"), {
      target: { value: "012-345 6789" },
    });
    fireEvent.change(screen.getByLabelText("Delivery address"), {
      target: { value: "12 Test Street, Kuala Lumpur" },
    });
    fireEvent.click(screen.getByRole("radio", { name: /Lunch 1/ }));
    fireEvent.click(screen.getByRole("button", { name: "Review delivery details" }));
    fireEvent.click(screen.getByRole("button", { name: "Place order" }));

    expect(await screen.findByRole("alert")).toBeDefined();
    expect(screen.queryByText("Order submitted")).toBeNull();
    expect(loadCart(localStorage)).toEqual([{ itemId: testMain.id, quantity: 1 }]);
    const firstRequestKey = fetch.mock.calls[0][1].headers["Idempotency-Key"];

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Place order" }));
    });

    expect(await screen.findByText("Order submitted")).toBeDefined();
    expect(screen.getByText("KP-SAVED-REFERENCE")).toBeDefined();
    expect(fetch.mock.calls[1][1].headers["Idempotency-Key"]).toBe(firstRequestKey);
    expect(loadCart(localStorage)).toEqual([]);
  });

  test("prevents checkout when a cart item has sold out", () => {
    startWith([
      { itemId: testMain.id, quantity: 1 },
      { itemId: testSoldOut.id, quantity: 1 },
    ]);

    expect(screen.getByRole("alert").textContent).toContain("Some items have sold out");
    expect(screen.queryByRole("button", { name: "Review delivery details" })).toBeNull();
    expect(screen.getByRole("link", { name: "Review your cart" }).getAttribute("href")).toBe(
      "/cart",
    );
  });

  test("keeps cart selections when returning from checkout to the cart", () => {
    const lines = [
      { itemId: testMain.id, quantity: 2 },
      { itemId: testMain2.id, quantity: 1 },
    ];
    const checkout = startWith(lines);

    expect(screen.getByText("Test Rice Set").closest("li")?.textContent).toContain("× 2");
    expect(loadCart(localStorage)).toEqual(lines);
    checkout.unmount();
    renderWithCart(<CartView menuItems={testMenuItems} />);

    expect(screen.getByText("2 × RM15.00")).toBeDefined();
    expect(screen.getByText("1 × RM8.00")).toBeDefined();
  });
});
