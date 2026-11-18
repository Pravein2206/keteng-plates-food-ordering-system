// Menu shapes used by the app (camelCase, prices in sen).

export type MenuItem = {
  id: number;
  code: string;
  name: string;
  priceSen: number;
  isAvailable: boolean;
};

export type MenuCategory = {
  id: number;
  name: string;
  items: MenuItem[];
};
