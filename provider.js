// Punto único de integración con IA. Si en el futuro quieres cambiar de
// proveedor (OpenAI, Gemini, un modelo propio…), solo tienes que reescribir
// la función `callAI` de este archivo: el resto de la app solo conoce
// `callAI(prompt, opts)` y no sabe nada de Anthropic.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.AI_MODEL || 'claude-sonnet-5';

export function isAIConfigured() {
  return Boolean(ANTHROPIC_API_KEY);
}

/**
 * Llama al modelo y devuelve el texto de la respuesta.
 * @param {string} systemPrompt - instrucciones de sistema
 * @param {string} userPrompt - petición concreta
 * @param {{ maxTokens?: number }} opts
 */
export async function callAI(systemPrompt, userPrompt, opts = {}) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      'Falta configurar ANTHROPIC_API_KEY en las variables de entorno del servidor.'
    );
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts.maxTokens || 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error de la API de IA (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return (data.content || [])
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n')
    .trim();
}

/**
 * Llama al modelo pidiendo JSON estricto y lo parsea, quitando posibles
 * bloques de código markdown que el modelo añada por costumbre.
 */
export async function callAIForJSON(systemPrompt, userPrompt, opts = {}) {
  const raw = await callAI(
    `${systemPrompt}\n\nResponde ÚNICAMENTE con JSON válido, sin explicaciones, sin markdown y sin bloques de código.`,
    userPrompt,
    opts
  );
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}
