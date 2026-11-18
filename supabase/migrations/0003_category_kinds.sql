-- US02: give each menu section a type, used by the cart rules.
--   main   = main dishes (can be ordered alone)
--   add_on = extras (must be ordered with at least one main)
--   drink  = drinks (can be ordered alone; pending owner confirmation, see issue #19)
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.

alter table public.menu_categories
  add column kind text not null default 'main'
  check (kind in ('main', 'add_on', 'drink'));

update public.menu_categories
set kind = 'add_on'
where name in ('Add On Ayam Crispy Beso (1 pc)', 'Add On');

update public.menu_categories
set kind = 'drink'
where name = 'Minuman';

-- New sections must choose a type on purpose.
alter table public.menu_categories alter column kind drop default;
