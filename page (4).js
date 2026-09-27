'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import RecipeCard from '../../components/RecipeCard';
import SuggestionCard from '../../components/SuggestionCard';
import { matchRecipe, normalize } from '../../lib/matching';

export default function DespensaPage() {
  const [pantry, setPantry] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSaved, setAiSaved] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: pantryData }, { data: recipeData }] = await Promise.all([
      supabase.from('pantry_items').select('*').order('ingredient'),
      supabase.from('recipes').select('*'),
    ]);
    setPantry(pantryData || []);
    setRecipes(recipeData || []);
    setLoading(false);
  }

  async function addIngredient(e) {
    e.preventDefault();
    const value = newIngredient.trim();
    if (!value) return;

    const exists = pantry.some((p) => normalize(p.ingredient) === normalize(value));
    if (exists) {
      setNewIngredient('');
      return;
    }

    const { data, error } = await supabase
      .from('pantry_items')
      .insert({
        ingredient: value,
        quantity: newQuantity ? Number(newQuantity) : null,
        unit: newUnit.trim() || null,
      })
      .select()
      .single();

    if (!error && data) {
      setPantry((prev) => [...prev, data].sort((a, b) => a.ingredient.localeCompare(b.ingredient)));
    }
    setNewIngredient('');
    setNewQuantity('');
    setNewUnit('');
  }

  async function removeIngredient(item) {
    setPantry((prev) => prev.filter((p) => p.id !== item.id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(item.ingredient);
      return next;
    });
    await supabase.from('pantry_items').delete().eq('id', item.id);
  }

  function toggleSelected(ingredient) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) next.delete(ingredient);
      else next.add(ingredient);
      return next;
    });
  }

  async function toggleFavorite(recipe) {
    const next = !recipe.is_favorite;
    setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? { ...r, is_favorite: next } : r)));
    await supabase.from('recipes').update({ is_favorite: next }).eq('id', recipe.id);
  }

  async function generateWithAI() {
    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);
    setAiSaved(false);
    try {
      const res = await fetch('/api/ai/generate-from-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo generar la receta.');
      setAiSuggestion({
        source_id: `ai-${Date.now()}`,
        title: data.recipe.title,
        category: 'Generada con IA',
        country: data.recipe.country || null,
        image_url: null,
        ingredients: data.recipe.ingredients,
        steps: data.recipe.steps,
        meal_type: data.recipe.meal_type || 'comida',
        difficulty: data.recipe.difficulty || 'media',
        time_minutes: data.recipe.time_minutes || 30,
        servings: data.recipe.servings || null,
        source_url: null,
      });
    } catch (err) {
      setAiError(err.message);
    }
    setAiLoading(false);
  }

  async function saveAiRecipe(suggestion, mealType) {
    const { error } = await supabase.from('recipes').insert({
      title: suggestion.title,
      meal_type: mealType,
      difficulty: suggestion.difficulty,
      time_minutes: suggestion.time_minutes,
      servings: suggestion.servings,
      country: suggestion.country,
      ingredients: suggestion.ingredients,
      steps: suggestion.steps,
      image_url: suggestion.image_url,
      is_custom: true,
      ai_generated: true,
    });
    if (!error) setAiSaved(true);
  }

  const pantrySet = useMemo(() => new Set(pantry.map((p) => normalize(p.ingredient))), [pantry]);

  const suggestions = useMemo(() => {
    if (pantrySet.size === 0) return [];
    return recipes
      .map((recipe) => ({ recipe, match: matchRecipe(pantrySet, recipe.ingredients || []) }))
      .filter((r) => r.match.tienes.length > 0)
      .sort((a, b) => b.match.porcentaje - a.match.porcentaje);
  }, [recipes, pantrySet]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Tu despensa</h1>
        <p className="text-ink/60 text-sm">
          Anota lo que tienes en casa y te proponemos qué puedes cocinar, o pídele a la IA una
          receta hecha a medida con lo que selecciones.
        </p>
      </div>

      <form onSubmit={addIngredient} className="flex flex-wrap gap-2 max-w-xl">
        <input
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          placeholder="Ingrediente (ej. huevos)"
          className="input flex-1 min-w-[160px]"
        />
        <input
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          type="number"
          min="0"
          placeholder="Cantidad"
          className="input w-28"
        />
        <input
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          placeholder="Unidad (g, ud…)"
          className="input w-32"
        />
        <button type="submit" className="px-4 py-2 rounded-md bg-pine text-paper text-sm hover:bg-pine2">
          Añadir
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-ink/50">
          Marca los que quieras usar para pedirle una receta a la IA ({selected.size} seleccionados).
        </p>
        <div className="flex flex-wrap gap-2">
          {pantry.map((item) => (
            <label
              key={item.id}
              className={`flex items-center gap-2 text-sm border rounded-full px-3 py-1 cursor-pointer transition-colors ${
                selected.has(item.ingredient)
                  ? 'bg-pine text-paper border-pine'
                  : 'bg-white/70 border-line'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selected.has(item.ingredient)}
                onChange={() => toggleSelected(item.ingredient)}
              />
              {item.ingredient}
              {(item.quantity || item.unit) && (
                <span className="opacity-70">
                  ({item.quantity || ''} {item.unit || ''})
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  removeIngredient(item);
                }}
                className={selected.has(item.ingredient) ? 'text-paper/70 hover:text-paper' : 'text-ink/40 hover:text-paprika'}
                aria-label={`Quitar ${item.ingredient}`}
              >
                ×
              </button>
            </label>
          ))}
          {!loading && pantry.length === 0 && (
            <p className="text-sm text-ink/50">
              Tu despensa está vacía. Añade algunos ingredientes para ver sugerencias.
            </p>
          )}
        </div>

        {selected.size > 0 && (
          <button
            onClick={generateWithAI}
            disabled={aiLoading}
            className="self-start mt-1 text-sm px-4 py-2.5 rounded-md bg-mustard/20 border border-mustard/50 text-ink hover:bg-mustard/30 disabled:opacity-50"
          >
            {aiLoading ? 'Creando receta…' : `✨ Crear receta con estos ${selected.size} ingredientes (IA)`}
          </button>
        )}

        {aiError && <p className="text-sm text-paprika">{aiError}</p>}

        {aiSuggestion && (
          <div className="max-w-sm mt-2">
            <SuggestionCard
              suggestion={aiSuggestion}
              onImport={saveAiRecipe}
              imported={aiSaved}
            />
          </div>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-pine">Puedes cocinar</h2>
        {loading ? (
          <p className="text-ink/50 text-sm">Cargando…</p>
        ) : suggestions.length === 0 ? (
          <p className="text-ink/50 text-sm">
            Todavía no hay coincidencias con recetas de "Mis recetas".
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map(({ recipe, match }) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onToggleFavorite={toggleFavorite}
                matchInfo={match}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
