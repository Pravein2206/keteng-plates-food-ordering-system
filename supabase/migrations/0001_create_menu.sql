-- US01: menu categories and menu items.
-- Prices are stored as whole numbers of sen (RM1 = 100 sen), never decimals.
-- Run in the Supabase dashboard: SQL Editor > New query > paste > Run.

create table public.menu_categories (
  id bigint generated always as identity primary key,
  name text not null unique check (length(trim(name)) > 0),
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.menu_categories (id) on delete restrict,
  -- The owner's item code from the Google Form, e.g. M1, MY2, S1.
  code text not null unique check (code ~ '^[A-Z]+[0-9]+$'),
  name text not null check (length(trim(name)) > 0),
  price_sen integer not null check (price_sen > 0),
  is_available boolean not null default true,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create index menu_items_category_id_idx on public.menu_items (category_id);

-- Row Level Security: anyone (guests included) may READ the menu.
-- There are no insert/update/delete policies, so nobody can change the menu
-- through the app. Staff menu editing comes in US09. Until then, change the
-- menu in the Supabase dashboard (Table Editor).
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;

create policy "Anyone can read menu categories"
  on public.menu_categories for select
  to anon, authenticated
  using (true);

create policy "Anyone can read menu items"
  on public.menu_items for select
  to anon, authenticated
  using (true);

-- Make sure the public API roles can read these tables (RLS still applies).
grant select on public.menu_categories to anon, authenticated;
grant select on public.menu_items to anon, authenticated;
