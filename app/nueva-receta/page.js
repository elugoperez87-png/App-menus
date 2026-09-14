'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const initialState = {
  title: '',
  meal_type: 'desayuno',
  difficulty: 'facil',
  time_minutes: '',
  ingredients: '',
  steps: '',
  image_url: '',
};

export default function NuevaRecetaPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const ingredientsArray = form.ingredients
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const { data, error: insertError } = await supabase
      .from('recipes')
      .insert({
        title: form.title.trim(),
        meal_type: form.meal_type,
        difficulty: form.difficulty,
        time_minutes: Number(form.time_minutes) || 0,
        ingredients: ingredientsArray,
        steps: form.steps.trim(),
        image_url: form.image_url.trim() || null,
        is_custom: true,
      })
      .select()
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/receta/${data.id}`);
  }

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Añadir receta</h1>
        <p className="text-ink/60 text-sm">Guarda una receta tuya para tenerla siempre a mano.</p>
      </div>

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
              <option value="desayuno">Desayuno</option>
              <option value="comida">Comida</option>
              <option value="cena">Cena</option>
            </select>
          </Field>

          <Field label="Dificultad">
            <select
              value={form.difficulty}
              onChange={(e) => update('difficulty', e.target.value)}
              className="input"
            >
              <option value="facil">Fácil</option>
              <option value="media">Media</option>
              <option value="dificil">Difícil</option>
            </select>
          </Field>
        </div>

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

        <Field label="URL de imagen (opcional)">
          <input
            value={form.image_url}
            onChange={(e) => update('image_url', e.target.value)}
            className="input"
            placeholder="https://..."
          />
        </Field>

        {error && <p className="text-sm text-paprika">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="self-start px-5 py-2.5 rounded-md bg-pine text-paper text-sm hover:bg-pine2 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar receta'}
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #d9d2be;
          border-radius: 0.5rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          background: rgba(255, 255, 255, 0.7);
        }
        .input:focus {
          outline: none;
          border-color: #33452c;
        }
      `}</style>
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
