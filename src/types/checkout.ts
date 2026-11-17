import type { CartLine } from "@/lib/cart";
import type { DeliveryDetails } from "@/lib/delivery-details";

// US04 handoff payload. The total is intentionally omitted: the server must
// recalculate it from current database prices when an order is submitted.
export type CheckoutData = {
  items: CartLine[];
  delivery: DeliveryDetails;
};
