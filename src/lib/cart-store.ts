// A tiny store that holds the cart, saves every change to the phone, and tells
// React when the cart changes (used with React's useSyncExternalStore).
import type { MenuItem } from "@/types/menu";
import { addItem, decreaseQuantity, removeItem, type CartLine } from "./cart";
import { loadCart, saveCart } from "./cart-storage";

// While the page is first rendered on the server there is no saved cart yet.
const EMPTY_CART: CartLine[] = [];

export type CartStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => CartLine[];
  getServerSnapshot: () => CartLine[];
  add: (item: MenuItem) => void;
  decrease: (itemId: number) => void;
  remove: (itemId: number) => void;
};

export function createCartStore(storage: Storage | undefined): CartStore {
  let lines: CartLine[] | null = null; // null = not loaded from storage yet
  const listeners = new Set<() => void>();

  const getSnapshot = () => {
    if (lines === null) lines = loadCart(storage);
    return lines;
  };

  const update = (change: (cart: CartLine[]) => CartLine[]) => {
    const current = getSnapshot();
    const next = change(current);
    if (next === current) return; // nothing changed (e.g. sold-out item refused)
    lines = next;
    saveCart(storage, next);
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot,
    getServerSnapshot: () => EMPTY_CART,
    add: (item) => update((cart) => addItem(cart, item)),
    decrease: (itemId) => update((cart) => decreaseQuantity(cart, itemId)),
    remove: (itemId) => update((cart) => removeItem(cart, itemId)),
  };
}
