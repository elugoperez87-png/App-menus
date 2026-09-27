-- Ejecuta esto en el SQL Editor de Supabase SI YA TENÍAS la base de datos de
-- la versión anterior de la app. No borra nada de lo que ya tienes.

alter table recipes add column if not exists servings integer;
alter table recipes add column if not exists country text;
alter table recipes add column if not exists tags text[] not null default '{}';
alter table recipes add column if not exists nutrition jsonb;
alter table recipes add column if not exists source_url text;
alter table recipes add column if not exists is_favorite boolean not null default false;
alter table recipes add column if not exists ai_generated boolean not null default false;

-- El tipo de comida y la dificultad dejan de estar restringidos por un CHECK
-- rígido, para poder añadir categorías nuevas sin tener que migrar la base
-- de datos otra vez (la validación ahora vive en lib/categories.js).
alter table recipes drop constraint if exists recipes_meal_type_check;
alter table recipes drop constraint if exists recipes_difficulty_check;

alter table pantry_items add column if not exists quantity numeric;
alter table pantry_items add column if not exists unit text;

-- Marca como favoritas las recetas que ya tenías guardadas en "Mi lista",
-- para que no desaparezcan de la nueva pestaña "Favoritas".
update recipes
set is_favorite = true
where id in (select recipe_id from saved_meals);
