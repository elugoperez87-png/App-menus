-- Ejecuta este script completo en el SQL Editor de tu proyecto de Supabase.

create extension if not exists "pgcrypto";

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meal_type text not null check (meal_type in ('desayuno','comida','cena')),
  difficulty text not null check (difficulty in ('facil','media','dificil')),
  time_minutes integer not null default 0,
  ingredients text[] not null default '{}',
  steps text not null default '',
  image_url text,
  is_custom boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists saved_meals (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (recipe_id)
);

create table if not exists pantry_items (
  id uuid primary key default gen_random_uuid(),
  ingredient text not null unique,
  created_at timestamptz not null default now()
);

-- Esta app está pensada para uso personal (sin login), por lo que se permite
-- acceso completo con la clave "anon". Si más adelante añades autenticación,
-- sustituye estas políticas por unas que filtren por auth.uid().
alter table recipes enable row level security;
alter table saved_meals enable row level security;
alter table pantry_items enable row level security;

drop policy if exists "allow all recipes" on recipes;
create policy "allow all recipes" on recipes for all using (true) with check (true);

drop policy if exists "allow all saved_meals" on saved_meals;
create policy "allow all saved_meals" on saved_meals for all using (true) with check (true);

drop policy if exists "allow all pantry_items" on pantry_items;
create policy "allow all pantry_items" on pantry_items for all using (true) with check (true);

-- Recetas de ejemplo para empezar a usar la app de inmediato.
-- Las imágenes son de LoremFlickr (gratuitas, sin necesidad de API key);
-- puedes reemplazar image_url por tus propias fotos cuando quieras.
insert into recipes (title, meal_type, difficulty, time_minutes, ingredients, steps, image_url, is_custom)
values
(
  'Tostadas con aguacate y huevo',
  'desayuno', 'facil', 10,
  ARRAY['pan', 'aguacate', 'huevo', 'sal', 'limón'],
  E'1. Tuesta el pan.\n2. Machaca el aguacate con sal y unas gotas de limón.\n3. Fríe o escalfa el huevo.\n4. Unta el aguacate sobre el pan y coloca el huevo encima.',
  'https://loremflickr.com/800/600/avocado,toast',
  false
),
(
  'Avena con plátano y canela',
  'desayuno', 'facil', 8,
  ARRAY['avena', 'leche', 'plátano', 'canela', 'miel'],
  E'1. Calienta la leche y añade la avena.\n2. Cocina a fuego bajo 5 minutos removiendo.\n3. Sirve con el plátano en rodajas, canela y miel.',
  'https://loremflickr.com/800/600/oatmeal,banana',
  false
),
(
  'Tortilla francesa con espinacas',
  'desayuno', 'media', 15,
  ARRAY['huevo', 'espinacas', 'queso', 'sal', 'aceite de oliva'],
  E'1. Saltea las espinacas en aceite hasta que reduzcan.\n2. Bate los huevos con sal.\n3. Vierte el huevo en la sartén, añade el queso y las espinacas.\n4. Dobla la tortilla cuando cuaje por debajo.',
  'https://loremflickr.com/800/600/omelette,spinach',
  false
),
(
  'Pancakes integrales',
  'desayuno', 'media', 25,
  ARRAY['harina integral', 'huevo', 'leche', 'levadura', 'miel', 'mantequilla'],
  E'1. Mezcla los ingredientes secos.\n2. Añade el huevo, la leche y la miel, mezcla sin grumos.\n3. Cocina porciones en una sartén con mantequilla hasta dorar por ambos lados.',
  'https://loremflickr.com/800/600/pancakes',
  false
),
(
  'Ensalada de garbanzos y atún',
  'comida', 'facil', 15,
  ARRAY['garbanzos', 'atún', 'tomate', 'cebolla', 'aceite de oliva', 'sal'],
  E'1. Escurre los garbanzos y el atún.\n2. Corta el tomate y la cebolla en trozos pequeños.\n3. Mezcla todo con aceite de oliva y sal.',
  'https://loremflickr.com/800/600/chickpea,salad',
  false
),
(
  'Arroz con pollo y verduras',
  'comida', 'media', 40,
  ARRAY['arroz', 'pollo', 'pimiento', 'cebolla', 'ajo', 'caldo de pollo', 'aceite de oliva'],
  E'1. Sofríe la cebolla, el ajo y el pimiento en aceite.\n2. Añade el pollo troceado y dóralo.\n3. Incorpora el arroz y el caldo caliente.\n4. Cocina tapado a fuego bajo 18-20 minutos.',
  'https://loremflickr.com/800/600/rice,chicken',
  false
),
(
  'Lentejas estofadas',
  'comida', 'media', 45,
  ARRAY['lentejas', 'zanahoria', 'cebolla', 'ajo', 'tomate', 'aceite de oliva', 'sal'],
  E'1. Sofríe la cebolla, el ajo y la zanahoria.\n2. Añade el tomate y cocina 5 minutos.\n3. Incorpora las lentejas y agua hasta cubrir.\n4. Cocina 30-35 minutos hasta que estén tiernas.',
  'https://loremflickr.com/800/600/lentil,stew',
  false
),
(
  'Pasta con salsa de tomate y albahaca',
  'comida', 'facil', 20,
  ARRAY['pasta', 'tomate', 'ajo', 'albahaca', 'aceite de oliva', 'sal'],
  E'1. Cuece la pasta según el paquete.\n2. Sofríe el ajo en aceite, añade el tomate triturado y sal.\n3. Cocina la salsa 10 minutos y añade albahaca fresca.\n4. Mezcla con la pasta escurrida.',
  'https://loremflickr.com/800/600/pasta,tomato',
  false
),
(
  'Crema de calabaza',
  'cena', 'facil', 30,
  ARRAY['calabaza', 'cebolla', 'caldo de verduras', 'aceite de oliva', 'sal'],
  E'1. Sofríe la cebolla en aceite.\n2. Añade la calabaza troceada y el caldo.\n3. Cocina 20 minutos hasta que esté tierna.\n4. Tritura hasta obtener una crema fina.',
  'https://loremflickr.com/800/600/pumpkin,soup',
  false
),
(
  'Salmón al horno con limón',
  'cena', 'media', 25,
  ARRAY['salmón', 'limón', 'aceite de oliva', 'sal', 'ajo'],
  E'1. Precalienta el horno a 200°C.\n2. Coloca el salmón en una bandeja con aceite, ajo y limón.\n3. Hornea 15-18 minutos.',
  'https://loremflickr.com/800/600/salmon,lemon',
  false
),
(
  'Revuelto de champiñones y ajo',
  'cena', 'facil', 15,
  ARRAY['huevo', 'champiñones', 'ajo', 'aceite de oliva', 'sal', 'perejil'],
  E'1. Saltea los champiñones y el ajo en aceite.\n2. Bate los huevos con sal.\n3. Añade el huevo a la sartén y revuelve hasta cuajar.\n4. Termina con perejil picado.',
  'https://loremflickr.com/800/600/mushroom,eggs',
  false
),
(
  'Wok de verduras y tofu',
  'cena', 'dificil', 35,
  ARRAY['tofu', 'pimiento', 'brócoli', 'zanahoria', 'salsa de soja', 'ajo', 'jengibre', 'aceite'],
  E'1. Corta el tofu en cubos y dóralo en aceite; resérvalo.\n2. Saltea las verduras a fuego fuerte, empezando por las más duras.\n3. Añade ajo y jengibre picados.\n4. Incorpora el tofu y la salsa de soja, saltea 2 minutos más.',
  'https://loremflickr.com/800/600/tofu,vegetables',
  false
);
