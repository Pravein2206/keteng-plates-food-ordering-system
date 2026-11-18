-- US04: save customer orders atomically and allow only staff to read them.
-- Prices and totals are calculated from the current database menu, never from
-- values supplied by the browser. Run in Supabase SQL Editor after 0003.

create table public.delivery_batches (
  id text primary key check (id in ('lunch-1', 'lunch-2', 'dinner-1', 'dinner-2')),
  label text not null check (length(pg_catalog.btrim(label)) > 0),
  sort_order integer not null unique,
  enabled boolean not null,
  cutoff_date date,
  cutoff_time time without time zone,
  check ((cutoff_date is null) = (cutoff_time is null))
);

insert into public.delivery_batches (id, label, sort_order, enabled, cutoff_date, cutoff_time)
values
  ('lunch-1', 'Lunch 1', 1, true, null, null),
  ('lunch-2', 'Lunch 2', 2, true, null, null),
  ('dinner-1', 'Dinner 1', 3, true, null, null),
  ('dinner-2', 'Dinner 2', 4, true, null, null);

alter table public.delivery_batches enable row level security;
revoke all on public.delivery_batches from anon, authenticated;
grant select on public.delivery_batches to anon, authenticated;

create policy "Anyone can read delivery batches"
  on public.delivery_batches for select
  to anon, authenticated
  using (true);

create table public.orders (
  id bigint generated always as identity primary key,
  reference text not null unique
    default ('KP-' || upper(pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''))),
  idempotency_key uuid not null unique,
  idempotency_payload jsonb not null,
  customer_full_name text not null check (length(pg_catalog.btrim(customer_full_name)) > 0),
  phone_number text not null check (length(pg_catalog.btrim(phone_number)) > 0),
  delivery_address text not null check (length(pg_catalog.btrim(delivery_address)) > 0),
  delivery_batch_id text not null,
  delivery_batch_label text not null,
  total_sen bigint not null check (total_sen > 0),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  menu_item_id bigint not null,
  item_code text not null,
  item_name text not null,
  unit_price_sen integer not null check (unit_price_sen > 0),
  quantity integer not null check (quantity > 0),
  line_total_sen bigint not null check (line_total_sen > 0),
  unique (order_id, menu_item_id)
);

create index orders_created_at_idx on public.orders (created_at desc);
create index order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.orders, public.order_items from anon, authenticated;
grant select on public.orders, public.order_items to authenticated;

create policy "Staff can read orders"
  on public.orders for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'staff');

create policy "Staff can read order items"
  on public.order_items for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'staff');

create function public.submit_order(
  p_idempotency_key uuid,
  p_items jsonb,
  p_delivery jsonb
)
returns table (outcome text, order_reference text, total_sen bigint)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_full_name text;
  v_phone_number text;
  v_address text;
  v_batch_id text;
  v_batch_label text;
  v_batch_enabled boolean;
  v_cutoff_date date;
  v_cutoff_time time without time zone;
  v_local_now timestamp without time zone;
  v_item_count integer;
  v_valid_item_count integer;
  v_subtotal_sen bigint;
  v_total_sen bigint;
  v_has_main boolean;
  v_has_add_on boolean;
  v_payload jsonb;
  v_order_id bigint;
  v_reference text;
  v_existing_payload jsonb;
  v_existing_total bigint;
begin
  if p_idempotency_key is null
    or pg_catalog.jsonb_typeof(p_items) is distinct from 'array'
    or pg_catalog.jsonb_typeof(p_delivery) is distinct from 'object'
  then
    raise exception 'Invalid order request' using errcode = '22023';
  end if;

  if pg_catalog.jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one item' using errcode = '22023';
  end if;

  v_full_name := nullif(pg_catalog.btrim(p_delivery ->> 'fullName'), '');
  v_phone_number := nullif(pg_catalog.btrim(p_delivery ->> 'phoneNumber'), '');
  v_address := nullif(pg_catalog.btrim(p_delivery ->> 'address'), '');
  v_batch_id := p_delivery ->> 'deliveryBatchId';

  if v_full_name is null
    or v_phone_number is null
    or v_phone_number !~ '^[+]60(1[0-9]{8,9}|[3-9][0-9]{7,8})$'
    or v_address is null
    or v_batch_id is null
  then
    raise exception 'Invalid delivery details' using errcode = '22023';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_to_recordset(p_items) as input(item_id bigint, quantity integer)
    where input.item_id is null
      or input.item_id <= 0
      or input.quantity is null
      or input.quantity <= 0
  ) then
    raise exception 'Invalid order item' using errcode = '22023';
  end if;

  if exists (
    select input.item_id
    from pg_catalog.jsonb_to_recordset(p_items) as input(item_id bigint, quantity integer)
    group by input.item_id
    having pg_catalog.count(*) > 1
  ) then
    raise exception 'Duplicate order item' using errcode = '22023';
  end if;

  select pg_catalog.jsonb_build_object(
    'items',
    (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object('item_id', input.item_id, 'quantity', input.quantity)
        order by input.item_id
      )
      from pg_catalog.jsonb_to_recordset(p_items) as input(item_id bigint, quantity integer)
    ),
    'delivery',
    pg_catalog.jsonb_build_object(
      'fullName', v_full_name,
      'phoneNumber', v_phone_number,
      'address', v_address,
      'deliveryBatchId', v_batch_id
    )
  )
  into v_payload;

  select orders.reference, orders.total_sen, orders.idempotency_payload
  into v_reference, v_existing_total, v_existing_payload
  from public.orders as orders
  where orders.idempotency_key = p_idempotency_key;

  if found then
    if v_existing_payload is distinct from v_payload then
      return query select 'conflict'::text, null::text, null::bigint;
      return;
    end if;

    return query select 'duplicate'::text, v_reference, v_existing_total;
    return;
  end if;

  select batch.label, batch.enabled, batch.cutoff_date, batch.cutoff_time
  into v_batch_label, v_batch_enabled, v_cutoff_date, v_cutoff_time
  from public.delivery_batches as batch
  where batch.id = v_batch_id
  for share;

  if not found or not coalesce(v_batch_enabled, false) then
    raise exception 'Delivery batch is not available' using errcode = '22023';
  end if;

  if v_cutoff_date is not null then
    v_local_now := pg_catalog.timezone('Asia/Kuala_Lumpur', pg_catalog.now());
    if pg_catalog.date_trunc('minute', v_local_now) >= v_cutoff_date + v_cutoff_time then
      raise exception 'Delivery batch has closed' using errcode = '22023';
    end if;
  end if;

  perform menu_item.id
  from pg_catalog.jsonb_to_recordset(p_items) as input(item_id bigint, quantity integer)
  join public.menu_items as menu_item on menu_item.id = input.item_id
  join public.menu_categories as category on category.id = menu_item.category_id
  order by menu_item.id
  for share of menu_item, category;

  select
    pg_catalog.count(*)::integer,
    coalesce(pg_catalog.sum(menu_item.price_sen::bigint * input.quantity::bigint), 0),
    coalesce(pg_catalog.bool_or(category.kind = 'main'), false),
    coalesce(pg_catalog.bool_or(category.kind = 'add_on'), false)
  into v_valid_item_count, v_subtotal_sen, v_has_main, v_has_add_on
  from pg_catalog.jsonb_to_recordset(p_items) as input(item_id bigint, quantity integer)
  join public.menu_items as menu_item on menu_item.id = input.item_id
  join public.menu_categories as category on category.id = menu_item.category_id
  where menu_item.is_available;

  v_item_count := pg_catalog.jsonb_array_length(p_items);
  if v_valid_item_count <> v_item_count then
    raise exception 'An order item is missing or unavailable' using errcode = '22023';
  end if;

  if v_has_add_on and not v_has_main then
    raise exception 'Add-ons must be ordered with a main dish' using errcode = '22023';
  end if;

  -- The delivery fee is the existing flat RM2 fee, added exactly once.
  v_total_sen := v_subtotal_sen + 200;

  insert into public.orders (
    idempotency_key,
    idempotency_payload,
    customer_full_name,
    phone_number,
    delivery_address,
    delivery_batch_id,
    delivery_batch_label,
    total_sen
  )
  values (
    p_idempotency_key,
    v_payload,
    v_full_name,
    v_phone_number,
    v_address,
    v_batch_id,
    v_batch_label,
    v_total_sen
  )
  on conflict (idempotency_key) do nothing
  returning id, reference
  into v_order_id, v_reference;

  if v_order_id is null then
    select orders.reference, orders.total_sen, orders.idempotency_payload
    into v_reference, v_existing_total, v_existing_payload
    from public.orders as orders
    where orders.idempotency_key = p_idempotency_key;

    if v_existing_payload is distinct from v_payload then
      return query select 'conflict'::text, null::text, null::bigint;
      return;
    end if;

    return query select 'duplicate'::text, v_reference, v_existing_total;
    return;
  end if;

  insert into public.order_items (
    order_id,
    menu_item_id,
    item_code,
    item_name,
    unit_price_sen,
    quantity,
    line_total_sen
  )
  select
    v_order_id,
    menu_item.id,
    menu_item.code,
    menu_item.name,
    menu_item.price_sen,
    input.quantity,
    menu_item.price_sen::bigint * input.quantity::bigint
  from pg_catalog.jsonb_to_recordset(p_items) as input(item_id bigint, quantity integer)
  join public.menu_items as menu_item on menu_item.id = input.item_id;

  return query select 'created'::text, v_reference, v_total_sen;
end;
$function$;

revoke all on function public.submit_order(uuid, jsonb, jsonb) from public;
revoke all on function public.submit_order(uuid, jsonb, jsonb) from anon, authenticated;
grant execute on function public.submit_order(uuid, jsonb, jsonb) to anon, authenticated;
