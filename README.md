# El cuaderno de menús

Asistente personal de cocina: gestiona tus recetas, descubre otras nuevas (por
sugerencia o por país/cultura), anota lo que tienes en la despensa y pídele a
la IA que te diga qué puedes cocinar o que te cree una receta a medida.

Hecho con **Next.js** (App Router) + **Tailwind CSS** + **Supabase**, con
funciones de IA vía **Anthropic API**, listo para **Vercel**.

## Novedades de esta versión

- Navegación: **Inicio / Mis recetas / Descubrir / Despensa / Perfil**.
- **Mis recetas**: todas tus recetas en un mismo sitio, con búsqueda, pestañas
  (Todas/Desayuno/Comida/Cena/Favoritas), edición y borrado.
- **Favoritas** sustituye a la antigua "Mi lista" (`/mis-comidas` ahora
  redirige automáticamente).
- **Descubrir** tiene dos pestañas: *Sugerir recetas* (con "Mostrar otras" y
  "No me interesa") y *Por país/cultura* (lista dinámica de países).
- **Despensa** ahora admite cantidad y unidad por ingrediente, selección de
  varios, y un botón para que la IA cree una receta con justo esos
  ingredientes.
- Cada receta puede tener raciones, país, etiquetas, información nutricional
  y fuente.
- El formulario de crear/editar receta tiene un panel de ayuda de IA
  (completar, sugerir pasos, proponer cantidades, adaptar a tu despensa o
  pedir un cambio concreto). **La IA nunca aplica nada sola**: cada campo se
  copia al formulario solo si pulsas "Usar".

## 1. Base de datos (Supabase)

**Si es un proyecto nuevo:** SQL Editor → pega y ejecuta `supabase/schema.sql`.

**Si ya tenías la app anterior:** SQL Editor → pega y ejecuta
`supabase/migration_v2.sql`. No borra nada de lo que ya tienes; solo añade
columnas y marca como favoritas las recetas que ya tenías en tu lista.

## 2. Variables de entorno

Copia `.env.local.example` a `.env.local` y rellena:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
ANTHROPIC_API_KEY=tu-clave-de-api      # opcional, pero necesaria para la IA
AI_MODEL=claude-sonnet-5               # opcional
```

Sin `ANTHROPIC_API_KEY` la app funciona igual, pero los botones de IA avisan
de que no está configurada (puedes verlo también en la pestaña **Perfil**).

## 3. Probar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## 4. GitHub

```bash
git init
git add .
git commit -m "Reestructuración: mis recetas, descubrir, despensa e IA"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

## 5. Vercel

1. **Add New → Project** → importa el repositorio.
2. En **Environment Variables** añade las cuatro variables del paso 2
   (`ANTHROPIC_API_KEY` y `AI_MODEL` incluidas, si quieres usar la IA).
3. Deploy. Cada `git push` vuelve a desplegar automáticamente.

## Cómo está organizada la app

- **Inicio (`/`)**: panel ligero con accesos rápidos, recetas recientes y
  favoritas.
- **Mis recetas (`/mis-recetas`)**: toda tu colección, con búsqueda, filtros
  por tipo de comida y favoritas. Desde aquí se crea (`/nueva-receta`) y se
  edita (`/receta/[id]/editar`) — solo se pueden editar recetas propias; las
  importadas desde Descubrir se pueden ver y duplicar, no editar en el sitio.
- **Descubrir (`/descubrir`)**:
  - *Sugerir recetas*: 6 recetas aleatorias de
    [TheMealDB](https://www.themealdb.com) (API abierta, sin clave). "Mostrar
    otras" evita repetir, dentro de lo razonable, las que ya te enseñó (lo
    recuerda incluso entre sesiones). "No me interesa" descarta una sin
    guardarla.
  - *Por país/cultura*: elige un país (la lista sale en vivo de la API, así
    que no hay que tocar código para añadir nuevos) y explora sus recetas
    típicas.
  - En ambas, "Añadir a mis recetas" guarda la receta en tu colección,
    eligiendo tú el tipo de comida.
- **Despensa (`/despensa`)**: ingredientes con cantidad/unidad opcionales.
  Marca varios y pulsa "Crear receta con estos ingredientes (IA)" para que el
  modelo proponga una receta priorizándolos; puedes guardarla directamente.
  Debajo, "Puedes cocinar" sigue mostrando qué recetas de tu colección puedes
  preparar ya, ordenadas por cuántos ingredientes te faltan.
- **Perfil (`/perfil`)**: estado de la IA (configurada o no) y estadísticas
  básicas de tu colección.

## Arquitectura de la IA

Toda llamada al modelo pasa por `lib/ai/provider.js` (server-side) y dos
rutas API (`/api/ai/generate-from-ingredients`, `/api/ai/assist`). Si algún
día quieres cambiar de proveedor, solo hay que reescribir ese archivo: el
resto de la app no sabe qué proveedor hay detrás. La clave de API nunca llega
al navegador.

## Fuente de recetas externas

Las recetas de "Descubrir" vienen de TheMealDB, una API pública gratuita, y
se importan con su enlace de origen cuando está disponible (botón "Ver receta
original"). Si más adelante añades otra fuente (otra API, scraping propio,
etc.), respeta siempre sus condiciones de uso y licencias; el punto de
integración está aislado en `lib/mealdb.js` para que cambiarlo no afecte al
resto de la app.

## Nota sobre seguridad

App de **uso personal, sin login**: cualquiera con el enlace y la clave
`anon` de Supabase puede leer y escribir datos, y solo tú tienes la clave de
Anthropic (vive en el servidor). Si en el futuro la compartes con más gente,
lo natural es añadir autenticación de Supabase y unas políticas de RLS que
filtren por usuario; en ese momento tendría sentido separar los favoritos en
su propia tabla (`favorites`) en vez de la columna `is_favorite` actual.

## Ideas para una siguiente fase

- Información nutricional calculada automáticamente (con IA o una API de
  nutrición) en vez de introducida a mano.
- Historial de recomendaciones para personalizar qué te sugiere Descubrir.
- Subir fotos propias (Supabase Storage) en vez de pegar una URL.
- Autenticación multiusuario.
- Planificador semanal y lista de la compra automática a partir de lo que
  falta en la despensa.
