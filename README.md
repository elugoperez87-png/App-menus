# El cuaderno de menús

App personal para tener a mano recetas de desayuno, comida y cena: dificultad,
tiempo, ingredientes, preparación e imagen. Puedes añadir tus propias recetas,
guardar tu lista de comidas y anotar tu despensa para recibir sugerencias
según lo que tienes.

Hecha con **Next.js** (App Router) + **Tailwind CSS** + **Supabase**, lista
para desplegar en **Vercel**.

## 1. Crear el proyecto en Supabase

1. Entra a https://supabase.com y crea un proyecto nuevo (elige una región y
   una contraseña de base de datos).
2. Ve a **SQL Editor** → pega todo el contenido de `supabase/schema.sql` →
   **Run**. Esto crea las tablas `recipes`, `saved_meals` y `pantry_items`,
   configura los permisos y carga 12 recetas de ejemplo.
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`

## 2. Configurar variables de entorno

1. Copia `.env.local.example` a `.env.local`.
2. Pega ahí tu `Project URL` y tu `anon key`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Probar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## 4. Subir a GitHub

```bash
git init
git add .
git commit -m "Primera versión del cuaderno de menús"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

(`.env.local` no se sube gracias al `.gitignore`.)

## 5. Desplegar en Vercel

1. Entra a https://vercel.com → **Add New → Project** → importa tu repositorio
   de GitHub.
2. En **Environment Variables**, añade las mismas dos variables que en tu
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Deploy. Cada vez que hagas `git push`, Vercel actualizará la app.

## Cómo está organizada la app

- **Recetario (`/`)**: todas las recetas (las de ejemplo + las tuyas),
  filtrables por desayuno/comida/cena. Botón para añadir a "Mi lista".
- **Mi lista (`/mis-comidas`)**: las recetas que has guardado, agrupadas por
  tipo de comida.
- **Despensa (`/despensa`)**: escribe los ingredientes que tienes en casa
  (sin cantidades) y la app te muestra qué recetas puedes preparar, ordenadas
  por cuántos ingredientes ya tienes, indicando lo que te falta.
- **Añadir receta (`/nueva-receta`)**: formulario para guardar tus propias
  recetas con imagen (puedes pegar la URL de cualquier foto, por ejemplo
  subida a https://imgur.com).

## Nota sobre seguridad

Esta app está pensada para **uso personal, sin inicio de sesión**: cualquiera
con el enlace y la clave `anon` puede leer y escribir datos. Es la
configuración más simple para un proyecto individual. Si en el futuro quieres
compartirla con más gente o hacerla pública, lo natural es añadir
autenticación de Supabase (email/contraseña o magic link) y ajustar las
políticas de la base de datos para que cada usuario solo vea sus propios
datos.

## Ideas para ampliar más adelante

- Subir fotos directamente (Supabase Storage) en vez de pegar una URL.
- Un planificador semanal (arrastrar recetas a los días de la semana).
- Generar automáticamente la lista de la compra a partir de lo que falta en
  la despensa.
