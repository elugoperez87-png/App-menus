'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import RecipeCard from '../../components/RecipeCard';
import { MEAL_TYPES } from '../../lib/categories';
import { normalize } from '../../lib/matching';

const TABS = [{ key: 'todas', label: 'Todas' }, ...MEAL_TYPES.map((m) => ({ key: m.key, label: m.label })), { key: 'favoritas', label: 'Favoritas' }];

export default function MisRecetasPage() {
  return (
    <Suspense fallback={<p className="text-ink/50 text-sm">Cargando…</p>}>
      <MisRecetasContent />
    </Suspense>
  );
}

function MisRecetasContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [recipes, setRecipes] = useState([]);
  const [tab, setTab] = useState(TABS.some((t) => t.key === initialTab) ? initialTab : 'todas');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setRecipes(data || []);
    setLoading(false);
  }

  async function toggleFavorite(recipe) {
    const next = !recipe.is_favorite;
    setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? { ...r, is_favorite: next } : r)));
    await supabase.from('recipes').update({ is_favorite: next }).eq('id', recipe.id);
  }

  const filtered = useMemo(() => {
    let list = recipes;
    if (tab === 'favoritas') list = list.filter((r) => r.is_favorite);
    else if (tab !== 'todas') list = list.filter((r) => r.meal_type === tab);

    const q = normalize(query.trim());
    if (q) {
      list = list.filter(
        (r) =>
          normalize(r.title).includes(q) ||
          (r.ingredients || []).some((i) => normalize(i).includes(q)) ||
          (r.tags || []).some((t) => normalize(t).includes(q)) ||
          (r.country && normalize(r.country).includes(q))
      );
    }
    return list;
  }, [recipes, tab, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Mis recetas</h1>
          <p className="text-ink/60 text-sm">Todo lo que has creado o guardado, en un mismo sitio.</p>
        </div>
        <Link
          href="/nueva-receta"
          className="self-start sm:self-auto text-sm px-4 py-2.5 rounded-md bg-pine text-paper hover:bg-pine2"
        >
          + Nueva receta
        </Link>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre, ingrediente, etiqueta o país…"
        className="input max-w-md"
      />

      <div className="flex gap-2 border-b border-line pb-3 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'bg-ink text-paper border-ink'
                : 'border-line text-ink/60 hover:border-ink/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-paprika">No se pudo conectar con Supabase: {error}</p>}

      {loading ? (
        <p className="text-ink/50 text-sm">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-ink/50 text-sm">
          No hay recetas aquí todavía. Prueba en{' '}
          <Link href="/descubrir" className="underline">
            Descubrir
          </Link>{' '}
          o crea una nueva.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
