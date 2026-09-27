import { NextResponse } from 'next/server';
import { callAIForJSON, isAIConfigured } from '../../../../lib/ai/provider';

export const runtime = 'nodejs';

const SYSTEM = `Eres un chef que crea recetas caseras, sencillas y realistas en español.
Debes devolver SIEMPRE un objeto JSON con exactamente estas claves:
{
  "title": string,
  "meal_type": "desayuno" | "comida" | "cena",
  "difficulty": "facil" | "media" | "dificil",
  "time_minutes": number,
  "servings": number,
  "country": string,
  "tags": string[],
  "ingredients": string[] (cada línea "cantidad + ingrediente", incluye TODOS los ingredientes usados, priorizando los que te den),
  "ingredients_extra": string[] (solo los ingredientes adicionales que no estaban en la lista del usuario),
  "steps": string (pasos numerados separados por saltos de línea)
}
Prioriza los ingredientes indicados por el usuario como protagonistas del plato.
Puedes añadir ingredientes auxiliares habituales (sal, aceite, especias básicas) si hacen falta,
pero indícalos también en "ingredients_extra".`;

export async function POST(request) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: 'La IA no está configurada. Añade ANTHROPIC_API_KEY en las variables de entorno.' },
      { status: 501 }
    );
  }

  const body = await request.json();
  const { ingredients = [], mealType, country } = body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return NextResponse.json({ error: 'Selecciona al menos un ingrediente.' }, { status: 400 });
  }

  const context = [
    `Ingredientes seleccionados: ${ingredients.join(', ')}.`,
    mealType ? `Tipo de comida deseado: ${mealType}.` : '',
    country ? `Ambienta la receta en la gastronomía de: ${country}.` : '',
    'Crea una receta usando sobre todo estos ingredientes.',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const recipe = await callAIForJSON(SYSTEM, context, { maxTokens: 1200 });
    return NextResponse.json({ recipe });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
