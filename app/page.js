'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import RecipeCard from '../components/RecipeCard';

const TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'comida', label: 'Comida' },
  { key: 'cena', label: 'Cena' },
];

export default function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [tab, setTab] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);

    const [{ data: recipeData, error: recipeError }, { data: savedData, error: savedError }] =
      await Promise.all([
        supabase.from('recipes').select('*').order('created_at', { ascending: false }),
        supabase.from('saved_meals').select('recipe_id'),
      ]);

    if (recipeError || savedError) {
      setError((recipeError || savedError).message);
    } else {
      setRecipes(recipeData || []);
      setSavedIds(new Set((savedData || []).map((s) => s.recipe_id)));
    }
    setLoading(false);
  }

  async function toggleSave(recipe) {
    const alreadySaved = savedIds.has(recipe.id);
    const next = new Set(savedIds);

    if (alreadySaved) {
      next.delete(recipe.id);
      setSavedIds(next);
      await supabase.from('saved_meals').delete().eq('recipe_id', recipe.id);
    } else {
      next.add(recipe.id);
      setSavedIds(next);
      await supabase.from('saved_meals').insert({ recipe_id: recipe.id });
    }
  }

  const filtered = useMemo(
    () => (tab === 'todos' ? recipes : recipes.filter((r) => r.meal_type === tab)),
    [recipes, tab]
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">¿Qué se cocina hoy?</h1>
        <p className="text-ink/60 text-sm">
          Explora recetas propuestas o las tuyas, y añádelas a tu lista de comidas.
        </p>
      </div>

      <div className="flex gap-2 border-b border-line pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              tab === t.key
                ? 'bg-ink text-paper border-ink'
                : 'border-line text-ink/60 hover:border-ink/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-paprika">
          No se pudo conectar con Supabase: {error}. Revisa tu archivo .env.local.
        </p>
      )}

      {loading ? (
        <p className="text-ink/50 text-sm">Cargando recetas…</p>
      ) : filtered.length === 0 ? (
        <p className="text-ink/50 text-sm">
          Aún no hay recetas aquí. Añade una desde &quot;Añadir receta&quot;.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              saved={savedIds.has(recipe.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
