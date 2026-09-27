import { NextResponse } from 'next/server';
import { callAIForJSON, isAIConfigured } from '../../../../lib/ai/provider';

export const runtime = 'nodejs';

const SYSTEM = `Eres un asistente de cocina que ayuda a una persona a completar o mejorar
UNA receta que está escribiendo en un formulario. Nunca inventes que la receta ya está
guardada: solo propones cambios que la persona podrá aceptar o no.
Debes devolver SIEMPRE un objeto JSON con esta forma (usa null en los campos que no
tenga sentido tocar para la acción pedida):
{
  "title": string | null,
  "servings": number | null,
  "time_minutes": number | null,
  "difficulty": "facil" | "media" | "dificil" | null,
  "ingredients": string[] | null,
  "steps": string | null,
  "note": string (una frase corta explicando qué has hecho)
}`;

export async function POST(request) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: 'La IA no está configurada. Añade ANTHROPIC_API_KEY en las variables de entorno.' },
      { status: 501 }
    );
  }

  const body = await request.json();
  const { action, recipe = {}, pantry = [], instruction = '' } = body;

  const recipeSummary = [
    `Título actual: ${recipe.title || '(sin título)'}`,
    `Ingredientes actuales: ${(recipe.ingredients || []).join(', ') || '(ninguno)'}`,
    `Pasos actuales: ${recipe.steps || '(sin pasos)'}`,
    `Raciones: ${recipe.servings || '(sin indicar)'}`,
    `Tiempo: ${recipe.time_minutes || '(sin indicar)'} minutos`,
  ].join('\n');

  let task;
  switch (action) {
    case 'completar':
      task = 'Completa los campos que falten (pasos, tiempo, dificultad, raciones) de forma coherente con el título y los ingredientes.';
      break;
    case 'pasos':
      task = 'Reescribe únicamente los pasos de preparación, numerados y claros, a partir del título y los ingredientes. No toques el resto de campos.';
      break;
    case 'cantidades':
      task = 'Reescribe la lista de ingredientes añadiendo una cantidad razonable a cada uno (para las raciones indicadas, o para 4 si no hay raciones). No toques los pasos.';
      break;
    case 'adaptar_despensa':
      task = `Adapta los ingredientes y, si hace falta, los pasos, para aprovechar al máximo estos ingredientes disponibles en casa: ${pantry.join(', ') || '(despensa vacía)'}. Sustituye lo que no se tenga por alternativas habituales cuando sea razonable.`;
      break;
    case 'instruccion':
      task = `Aplica este cambio pedido por la persona: "${instruction}". Solo modifica los campos que tengan sentido para ese cambio.`;
      break;
    default:
      return NextResponse.json({ error: 'Acción no reconocida.' }, { status: 400 });
  }

  const prompt = `${recipeSummary}\n\nTarea: ${task}`;

  try {
    const suggestion = await callAIForJSON(SYSTEM, prompt, { maxTokens: 1000 });
    return NextResponse.json({ suggestion });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
