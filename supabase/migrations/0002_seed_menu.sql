-- US01: initial menu, taken from the owner's Google Form (approved by the owner).
-- Items that had no price in the form (all of them sold out) are left out:
-- M10, M11, M13, M15, M16, N2, S3, AK1-AK4, SM1-SM4. Add them once the owner
-- gives prices.
-- Prices are in sen: RM14.90 = 1490.
-- Run once, after 0001_create_menu.sql.

insert into public.menu_categories (name, sort_order) values
  ('Set Ayam 3Ketol Beso', 10),
  ('Set Nasi Berbukit + Ayam Beso', 20),
  ('Add On Ayam Crispy Beso (1 pc)', 30),
  ('Add On', 40),
  ('Minuman', 50);

insert into public.menu_items (category_id, code, name, price_sen, sort_order)
select c.id, v.code, v.name, v.price_sen, v.sort_order
from (values
  ('Set Ayam 3Ketol Beso', 'M1', 'Ayam Korean Spicy', 1500, 10),
  ('Set Ayam 3Ketol Beso', 'M2', 'Ayam Cheesy', 1500, 20),
  ('Set Ayam 3Ketol Beso', 'M3', 'Ayam Korean Cheese', 1600, 30),

  ('Set Nasi Berbukit + Ayam Beso', 'M4', 'Nasi Ayam Korean', 800, 10),
  ('Set Nasi Berbukit + Ayam Beso', 'M5', 'Nasi Ayam Cheesy', 800, 20),
  ('Set Nasi Berbukit + Ayam Beso', 'M6', 'Nasi Ayam Korean Cheese', 900, 30),
  ('Set Nasi Berbukit + Ayam Beso', 'M7', 'Nasi Ayam Buttermilk', 800, 40),
  ('Set Nasi Berbukit + Ayam Beso', 'M8', 'Nasi Ayam Grepek Berapi', 800, 50),
  ('Set Nasi Berbukit + Ayam Beso', 'M14', 'Nasi Ayam Sambal Ijo', 800, 60),
  ('Set Nasi Berbukit + Ayam Beso', 'M9', 'Chicken Chop Beso Pelempang', 1490, 70),
  ('Set Nasi Berbukit + Ayam Beso', 'M17', 'Nasi Ayam Penyet Crispy', 800, 80),

  ('Add On Ayam Crispy Beso (1 pc)', 'MY1', 'Ayam Korea Spicy', 550, 10),
  ('Add On Ayam Crispy Beso (1 pc)', 'MY2', 'Ayam Cheesy', 550, 20),
  ('Add On Ayam Crispy Beso (1 pc)', 'MY3', 'Ayam Korea Cheesy', 650, 30),
  ('Add On Ayam Crispy Beso (1 pc)', 'MY4', 'Ayam Buttermilk', 550, 40),
  ('Add On Ayam Crispy Beso (1 pc)', 'MY5', 'Ayam Original', 450, 50),

  ('Add On', 'N1', 'Nasi Putih', 250, 10),
  ('Add On', 'S1', 'Sambal Grepek', 150, 20),
  ('Add On', 'S2', 'Sambal Ijo', 150, 30),
  ('Add On', 'S4', 'Sambal Penyet', 150, 40),
  ('Add On', 'F1', 'Kentang Goreng', 500, 50),
  ('Add On', 'F2', 'Telur Goreng', 150, 60),
  ('Add On', 'F3', 'Nuggets Tempura', 500, 70),

  ('Minuman', 'A1', 'Teh O Ais', 100, 10),
  ('Minuman', 'A2', 'Sirap Ais', 100, 20)
) as v (category_name, code, name, price_sen, sort_order)
join public.menu_categories c on c.name = v.category_name;
