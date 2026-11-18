"use client";

// Makes one shared cart available to every page. Wrap the app in <CartProvider>,
// then call useCart() in any client component.
import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { getBrowserStorage } from "@/lib/cart-storage";
import { createCartStore, type CartStore } from "@/lib/cart-store";

const CartContext = createContext<CartStore | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createCartStore(getBrowserStorage()));
  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

export function useCart() {
  const store = useContext(CartContext);
  if (!store) {
    throw new Error("useCart must be used inside <CartProvider>.");
  }
  const lines = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { lines, add: store.add, decrease: store.decrease, remove: store.remove };
}
