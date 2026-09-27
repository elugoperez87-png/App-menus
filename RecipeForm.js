'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MEAL_TYPES, DIFFICULTIES } from '../lib/categories';

const emptyForm = {
  title: '',
  meal_type: 'desayuno',
  difficulty: 'facil',
  time_minutes: '',
  servings: '',
  country: '',
  tags: '',
  ingredients: '',
  steps: '',
  image_url: '',
  source_url: '',
};

const ASSIST_ACTIONS = [
  { key: 'completar', label: 'Completar receta' },
  { key: 'pasos', label: 'Sugerir pasos' },
  { key: 'cantidades', label: 'Proponer cantidades' },
  { key: 'adaptar_despensa', label: 'Adaptar a mi despensa' },
  { key: 'instruccion', label: 'Pedir un cambio concreto' },
];

export default function RecipeForm({ initialValues, onSubmit, submitLabel = 'Guardar receta' }) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(initialValues
      ? {
          ...initialValues,
          tags: (initialValues.tags || []).join(', '),
          ingredients: (initialValues.ingredients || []).join(', '),
          time_minutes: initialValues.time_minutes ?? '',
          servings: initialValues.servings ?? '',
        }
      : {}),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [pantry, setPantry] = useState([]);

  const [assistAction, setAssistAction] = useState('completar');
  const [assistInstruction, setAssistInstruction] = useState('');
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistError, setAssistError] = useState(null);
  const [assistSuggestion, setAssistSuggestion] = useState(null);

  useEffect(() => {
    supabase
      .from('pantry_items')
      .select('ingredient')
      .then(({ data }) => setPantry((data || []).map((p) => p.ingredient)));
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      meal_type: form.meal_type,
      difficulty: form.difficulty,
      time_minutes: Number(form.time_minutes) || 0,
      servings: form.servings ? Number(form.servings) : null,
      country: form.country.trim() || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      ingredients: form.ingredients.split(',').map((i) => i.trim()).filter(Boolean),
      steps: form.steps.trim(),
      image_url: form.image_url.trim() || null,
      source_url: form.source_url.trim() || null,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function askAI() {
    setAssistLoading(true);
    setAssistError(null);
    setAssistSuggestion(null);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: assistAction,
          instruction: assistInstruction,
          pantry,
          recipe: {
            title: form.title,
            ingredients: form.ingredients.split(',').map((i) => i.trim()).filter(Boolean),
            steps: form.steps,
            servings: form.servings,
            time_minutes: form.time_minutes,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo obtener la sugerencia.');
      setAssistSuggestion(data.suggestion);
    } catch (err) {
      setAssistError(err.message);
    }
    setAssistLoading(false);
  }

  function applyField(field) {
    if (!assistSuggestion) return;
    const value = assistSuggestion[field];
    if (value === null || value === undefined) return;
    if (field === 'ingredients') {
      update('ingredients', value.join(', '));
    } else {
      update(field, value);
    }
  }

  function applyAll() {
    if (!assistSuggestion) return;
    ['title', 'servings', 'time_minutes', 'difficulty', 'ingredients', 'steps'].forEach(
      applyField
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nombre de la receta">
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="input"
            placeholder="Ej. Lentejas con verduras"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo de comida">
            <select
              value={form.meal_type}
              onChange={(e) => update('meal_type', e.target.value)}
              className="input"
            >
              {MEAL_TYPES.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Dificultad">
            <select
              value={form.difficulty}
              onChange={(e) => update('difficulty', e.target.value)}
              className="input"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tiempo de elaboración (minutos)">
            <input
              required
              type="number"
              min="0"
              value={form.time_minutes}
              onChange={(e) => update('time_minutes', e.target.value)}
              className="input"
              placeholder="30"
            />
          </Field>

          <Field label="Raciones">
            <input
              type="number"
              min="1"
              value={form.servings}
              onChange={(e) => update('servings', e.target.value)}
              className="input"
              placeholder="4"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="País / cultura (opcional)">
            <input
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              className="input"
              placeholder="Ej. México"
            />
          </Field>

          <Field label="Etiquetas (separadas por comas)">
            <input
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
              className="input"
              placeholder="rápido, vegetariano"
            />
          </Field>
        </div>

        <Field label="Ingredientes (separados por comas)">
          <textarea
            required
            value={form.ingredients}
            onChange={(e) => update('ingredients', e.target.value)}
            className="input min-h-[80px]"
            placeholder="lentejas, zanahoria, cebolla, ajo, aceite de oliva"
          />
        </Field>

        <Field label="Preparación">
          <textarea
            required
            value={form.steps}
            onChange={(e) => update('steps', e.target.value)}
            className="input min-h-[140px]"
            placeholder={'1. Sofríe la verdura...\n2. Añade las lentejas...'}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="URL de imagen (opcional)">
            <input
              value={form.image_url}
              onChange={(e) => update('image_url', e.target.value)}
              className="input"
              placeholder="https://..."
            />
          </Field>

          <Field label="Fuente (opcional)">
            <input
              value={form.source_url}
              onChange={(e) => update('source_url', e.target.value)}
              className="input"
              placeholder="https://..."
            />
          </Field>
        </div>

        {error && <p className="text-sm text-paprika">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="self-start px-5 py-2.5 rounded-md bg-pine text-paper text-sm hover:bg-pine2 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : submitLabel}
        </button>
      </form>

      <div className="border border-line rounded-lg p-4 bg-mustard/5 flex flex-col gap-3">
        <div>
          <h2 className="font-display text-lg text-ink">Ayuda de la IA</h2>
          <p className="text-xs text-ink/50">
            Te propone cambios: nada se aplica al formulario hasta que pulses "Usar".
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={assistAction}
            onChange={(e) => setAssistAction(e.target.value)}
            className="input sm:w-56"
          >
            {ASSIST_ACTIONS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
          {assistAction === 'instruccion' && (
            <input
              value={assistInstruction}
              onChange={(e) => setAssistInstruction(e.target.value)}
              className="input flex-1"
              placeholder="Ej. hazla apta para veganos"
            />
          )}
          <button
            type="button"
            onClick={askAI}
            disabled={assistLoading || !form.title}
            className="text-sm px-4 py-2 rounded-md border border-pine text-pine hover:bg-pine hover:text-paper disabled:opacity-50 shrink-0"
          >
            {assistLoading ? 'Pensando…' : 'Preguntar a la IA'}
          </button>
        </div>

        {!form.title && (
          <p className="text-xs text-ink/40">Escribe al menos un título para poder pedir ayuda.</p>
        )}

        {assistError && <p className="text-sm text-paprika">{assistError}</p>}

        {assistSuggestion && (
          <div className="bg-white/70 border border-line rounded-md p-3 flex flex-col gap-2 text-sm">
            {assistSuggestion.note && <p className="text-ink/60 italic">{assistSuggestion.note}</p>}

            {assistSuggestion.title && (
              <SuggestionRow label="Título" value={assistSuggestion.title} onUse={() => applyField('title')} />
            )}
            {assistSuggestion.servings && (
              <SuggestionRow
                label="Raciones"
                value={String(assistSuggestion.servings)}
                onUse={() => applyField('servings')}
              />
            )}
            {assistSuggestion.time_minutes && (
              <SuggestionRow
                label="Tiempo"
                value={`${assistSuggestion.time_minutes} min`}
                onUse={() => applyField('time_minutes')}
              />
            )}
            {assistSuggestion.difficulty && (
              <SuggestionRow
                label="Dificultad"
                value={assistSuggestion.difficulty}
                onUse={() => applyField('difficulty')}
              />
            )}
            {assistSuggestion.ingredients && (
              <SuggestionRow
                label="Ingredientes"
                value={assistSuggestion.ingredients.join(', ')}
                onUse={() => applyField('ingredients')}
              />
            )}
            {assistSuggestion.steps && (
              <SuggestionRow label="Pasos" value={assistSuggestion.steps} onUse={() => applyField('steps')} multiline />
            )}

            <button
              type="button"
              onClick={applyAll}
              className="self-start text-xs px-3 py-1.5 rounded-md bg-pine text-paper hover:bg-pine2"
            >
              Usar todo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionRow({ label, value, onUse, multiline }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-2 last:border-0 last:pb-0">
      <div className="flex-1">
        <span className="text-xs text-ink/40 block">{label}</span>
        <p className={multiline ? 'whitespace-pre-line' : ''}>{value}</p>
      </div>
      <button
        type="button"
        onClick={onUse}
        className="text-xs px-2 py-1 rounded border border-pine text-pine hover:bg-pine hover:text-paper shrink-0"
      >
        Usar
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink/70">{label}</span>
      {children}
    </label>
  );
}
