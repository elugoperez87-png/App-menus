'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import SuggestionCard from '../../components/SuggestionCard';
import CountryPicker from '../../components/CountryPicker';
import { fetchRandomMeals, fetchAreas, fetchMealsByArea, lookupMeal } from '../../lib/mealdb';

const SEEN_KEY = 'meal-planner:seen-suggestions';
const TABS = [
  { key: 'sugerir', label: 'Sugerir recetas' },
  { key: 'pais', label: 'Por país / cultura' },
];

export default function DescubrirPage() {
  const [tab, setTab] = useState('sugerir');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Descubrir</h1>
        <p className="text-ink/60 text-sm">
          Encuentra recetas nuevas y añádelas a "Mis recetas" con un toque.
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

      {tab === 'sugerir' ? <SugerirTab /> : <PorPaisTab />}
    </div>
  );
}

function useImportSuggestion() {
  const [importedIds, setImportedIds] = useState(new Set());

  async function importSuggestion(suggestion, mealType) {
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        title: suggestion.title,
        meal_type: mealType,
        difficulty: suggestion.difficulty,
        time_minutes: suggestion.time_minutes,
        servings: suggestion.servings || null,
        country: suggestion.country || null,
        ingredients: suggestion.ingredients,
        steps: suggestion.steps,
        image_url: suggestion.image_url,
        source_url: suggestion.source_url || null,
        is_custom: false,
      })
      .select()
      .single();

    if (!error && data) {
      setImportedIds((prev) => new Set(prev).add(suggestion.source_id));
    }
  }

  return { importedIds, importSuggestion };
}

function SugerirTab() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seenIds, setSeenIds] = useState(new Set());
  const { importedIds, importSuggestion } = useImportSuggestion();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
      setSeenIds(new Set(stored));
    } catch {
      // localStorage no disponible o dato corrupto: seguimos sin memoria previa
    }
    load(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(currentSeen) {
    setLoading(true);
    setError(null);
    try {
      let collected = [];
      let attempts = 0;
      while (collected.length < 6 && attempts < 4) {
        const batch = await fetchRandomMeals(6);
        const fresh = batch.filter(
          (m) => !currentSeen.has(m.source_id) && !collected.some((c) => c.source_id === m.source_id)
        );
        collected = [...collected, ...fresh];
        attempts++;
      }
      const finalList = collected.slice(0, 6);
      setSuggestions(finalList);
      const nextSeen = new Set([...currentSeen, ...finalList.map((f) => f.source_id)]);
      setSeenIds(nextSeen);
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...nextSeen].slice(-200)));
      } catch {
        // si no se puede persistir, no pasa nada: solo perdemos la memoria de repetidos
      }
    } catch {
      setError('No se pudo conectar con el buscador de recetas. Inténtalo de nuevo.');
    }
    setLoading(false);
  }

  function dismiss(suggestion) {
    setSuggestions((prev) => prev.filter((s) => s.source_id !== suggestion.source_id));
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-ink/50 max-w-md">
          Vienen de TheMealDB, una base de recetas abierta. Están en inglés y puedes ajustar el
          tipo de comida antes de añadirlas.
        </p>
        <button
          onClick={() => load(seenIds)}
          disabled={loading}
          className="text-sm px-4 py-2 rounded-md bg-mustard/20 border border-mustard/50 text-ink hover:bg-mustard/30 disabled:opacity-50 shrink-0"
        >
          {loading ? 'Buscando…' : 'Mostrar otras recetas'}
        </button>
      </div>

      {error && <p className="text-sm text-paprika">{error}</p>}

      {loading && suggestions.length === 0 ? (
        <p className="text-ink/50 text-sm">Buscando recetas nuevas…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((s) => (
            <SuggestionCard
              key={s.source_id}
              suggestion={s}
              onImport={importSuggestion}
              onDismiss={dismiss}
              imported={importedIds.has(s.source_id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PorPaisTab() {
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [selectedArea, setSelectedArea] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const { importedIds, importSuggestion } = useImportSuggestion();

  useEffect(() => {
    fetchAreas()
      .then(setAreas)
      .finally(() => setLoadingAreas(false));
  }, []);

  async function selectArea(area) {
    setSelectedArea(area);
    setLoadingMeals(true);
    const summaries = await fetchMealsByArea(area, 9);
    const details = await Promise.all(summaries.map((s) => lookupMeal(s.id)));
    setMeals(details.filter(Boolean));
    setLoadingMeals(false);
  }

  return (
    <section className="flex flex-col gap-4">
      <CountryPicker areas={areas} selected={selectedArea} onSelect={selectArea} loading={loadingAreas} />

      {selectedArea && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-pine">Cocina {selectedArea}</h2>
          {loadingMeals ? (
            <p className="text-ink/50 text-sm">Cargando recetas…</p>
          ) : meals.length === 0 ? (
            <p className="text-ink/50 text-sm">No se encontraron recetas para este país.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {meals.map((m) => (
                <SuggestionCard
                  key={m.source_id}
                  suggestion={m}
                  onImport={importSuggestion}
                  imported={importedIds.has(m.source_id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
