// Saves the cart on the customer's phone (browser localStorage) so it survives
// a refresh. Only item ids and quantities are stored: no prices, no personal data.
import type { CartLine } from "./cart";
import { isValidQuantity } from "./cart-total";

export const CART_STORAGE_KEY = "keteng-plates:cart:v1";

// Orders are for same-day batches, so an old cart is thrown away after 24 hours.
export const CART_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type StoredCart = {
  savedAt: number;
  lines: CartLine[];
};

// localStorage can be missing or blocked (e.g. some private browsing modes).
// In that case the cart simply is not saved; nothing breaks.
export function getBrowserStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function isValidLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.itemId === "number" &&
    Number.isInteger(line.itemId) &&
    line.itemId > 0 &&
    typeof line.quantity === "number" &&
    isValidQuantity(line.quantity)
  );
}

export function loadCart(storage: Storage | undefined, now: number = Date.now()): CartLine[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const stored = JSON.parse(raw) as Partial<StoredCart>;
    const isFresh = typeof stored.savedAt === "number" && now - stored.savedAt <= CART_MAX_AGE_MS;
    if (!isFresh || !Array.isArray(stored.lines)) {
      storage.removeItem(CART_STORAGE_KEY);
      return [];
    }

    // Keep only well-formed lines, one per item.
    const seen = new Set<number>();
    return stored.lines.filter((line): line is CartLine => {
      if (!isValidLine(line) || seen.has(line.itemId)) return false;
      seen.add(line.itemId);
      return true;
    });
  } catch {
    // Damaged data: start with an empty cart.
    return [];
  }
}

export function saveCart(
  storage: Storage | undefined,
  lines: CartLine[],
  now: number = Date.now(),
): void {
  if (!storage) return;
  try {
    if (lines.length === 0) {
      storage.removeItem(CART_STORAGE_KEY);
    } else {
      const stored: StoredCart = { savedAt: now, lines };
      storage.setItem(CART_STORAGE_KEY, JSON.stringify(stored));
    }
  } catch {
    // Storage full or blocked: keep working without saving.
  }
}
