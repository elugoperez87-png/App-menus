// Fuente externa de recetas para "Descubrir": TheMealDB, una API pública y
// gratuita (sin necesidad de clave). Está aislada en este archivo para que
// el día que quieras cambiar de fuente (otra API, otra base de datos) solo
// tengas que reescribir estas funciones: el resto de la app solo conoce
// fetchRandomMeals, fetchAreas, fetchMealsByArea y lookupMeal.

const BASE = 'https://www.themealdb.com/api/json/v1/1';

export async function fetchRandomMeals(count = 6) {
  const requests = Array.from({ length: count }, () =>
    fetch(`${BASE}/random.php`).then((r) => r.json())
  );
  const results = await Promise.all(requests);

  const seen = new Set();
  const meals = [];
  results.forEach((res) => {
    const meal = res?.meals?.[0];
    if (meal && !seen.has(meal.idMeal)) {
      seen.add(meal.idMeal);
      meals.push(mapMeal(meal));
    }
  });
  return meals;
}

// Lista de países/culturas disponibles en la fuente. Se pide en vivo, así
// que si la API añade nuevas áreas aparecen solas, sin tocar código.
export async function fetchAreas() {
  const res = await fetch(`${BASE}/list.php?a=list`);
  const data = await res.json();
  return (data.meals || []).map((m) => m.strArea).filter(Boolean).sort();
}

// Recetas (resumidas: id, nombre, foto) de un país/cultura concreto.
export async function fetchMealsByArea(area, limit = 12) {
  const res = await fetch(`${BASE}/filter.php?a=${encodeURIComponent(area)}`);
  const data = await res.json();
  return (data.meals || []).slice(0, limit).map((m) => ({
    id: m.idMeal,
    title: m.strMeal,
    image_url: m.strMealThumb,
  }));
}

// Detalle completo de una receta por id (para ver/importar desde la
// exploración por país, donde el listado inicial solo trae foto y nombre).
export async function lookupMeal(id) {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  const meal = data?.meals?.[0];
  return meal ? mapMeal(meal) : null;
}

export function mapMeal(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const line = measure && measure.trim() ? `${measure.trim()} ${ing.trim()}` : ing.trim();
      ingredients.push(line);
    }
  }

  return {
    source_id: meal.idMeal,
    title: meal.strMeal,
    category: meal.strCategory,
    country: meal.strArea || null,
    image_url: meal.strMealThumb,
    ingredients,
    steps: (meal.strInstructions || '').trim(),
    meal_type: guessMealType(meal.strCategory),
    difficulty: guessDifficulty(ingredients.length, meal.strInstructions),
    time_minutes: guessTime(meal.strCategory),
    source_url: meal.strSource || meal.strYoutube || null,
  };
}

function guessMealType(category) {
  if (!category) return 'comida';
  const c = category.toLowerCase();
  if (c.includes('breakfast')) return 'desayuno';
  if (c.includes('dessert') || c.includes('starter') || c.includes('side')) return 'cena';
  return 'comida';
}

function guessDifficulty(ingredientCount, instructions) {
  const steps = instructions ? instructions.split(/\r?\n/).filter(Boolean).length : 0;
  if (ingredientCount <= 6 && steps <= 4) return 'facil';
  if (ingredientCount >= 12 || steps >= 9) return 'dificil';
  return 'media';
}

function guessTime(category) {
  if (!category) return 30;
  const c = category.toLowerCase();
  if (c.includes('breakfast') || c.includes('dessert') || c.includes('side')) return 20;
  if (c.includes('beef') || c.includes('lamb') || c.includes('goat')) return 50;
  return 35;
}

// Emojis de bandera para los países más comunes en la fuente; si no hay
// mapeo se usa un icono genérico, así que nunca hace falta ampliar esta
// lista para que la app siga funcionando.
export const AREA_FLAGS = {
  American: '🇺🇸', British: '🇬🇧', Canadian: '🇨🇦', Chinese: '🇨🇳', Croatian: '🇭🇷',
  Dutch: '🇳🇱', Egyptian: '🇪🇬', Filipino: '🇵🇭', French: '🇫🇷', Greek: '🇬🇷',
  Indian: '🇮🇳', Irish: '🇮🇪', Italian: '🇮🇹', Jamaican: '🇯🇲', Japanese: '🇯🇵',
  Kenyan: '🇰🇪', Malaysian: '🇲🇾', Mexican: '🇲🇽', Moroccan: '🇲🇦', Polish: '🇵🇱',
  Portuguese: '🇵🇹', Russian: '🇷🇺', Spanish: '🇪🇸', Thai: '🇹🇭', Tunisian: '🇹🇳',
  Turkish: '🇹🇷', Vietnamese: '🇻🇳', Ukrainian: '🇺🇦', Unknown: '🍽️',
};
