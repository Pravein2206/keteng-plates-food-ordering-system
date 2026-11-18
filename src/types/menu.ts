// Menu shapes used by the app (camelCase, prices in sen).

// The type of menu section an item belongs to. Used by the cart rules:
// add-ons must be ordered with at least one main; mains and drinks can be ordered alone.
export type CategoryKind = "main" | "add_on" | "drink";

export type MenuItem = {
  id: number;
  code: string;
  name: string;
  priceSen: number;
  isAvailable: boolean;
  categoryKind: CategoryKind;
};

export type MenuCategory = {
  id: number;
  name: string;
  kind: CategoryKind;
  items: MenuItem[];
};
