'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import RecipeCard from '../../components/RecipeCard';
import { matchRecipe, normalize } from '../../lib/matching';

export default function DespensaPage() {
  const [pantry, setPantry] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: pantryData }, { data: recipeData }, { data: savedData }] = await Promise.all([
      supabase.from('pantry_items').select('*').order('ingredient'),
      supabase.from('recipes').select('*'),
      supabase.from('saved_meals').select('recipe_id'),
    ]);

    setPantry(pantryData || []);
    setRecipes(recipeData || []);
    setSavedIds(new Set((savedData || []).map((s) => s.recipe_id)));
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
      .insert({ ingredient: value })
      .select()
      .single();

    if (!error && data) {
      setPantry((prev) => [...prev, data].sort((a, b) => a.ingredient.localeCompare(b.ingredient)));
    }
    setNewIngredient('');
  }

  async function removeIngredient(item) {
    setPantry((prev) => prev.filter((p) => p.id !== item.id));
    await supabase.from('pantry_items').delete().eq('id', item.id);
  }

  async function toggleSave(recipe) {
    const alreadySaved = savedIds.has(recipe.id);
    const next = new Set(savedIds);
    if (alreadySaved) {
      next.delete(recipe.id);
      await supabase.from('saved_meals').delete().eq('recipe_id', recipe.id);
    } else {
      next.add(recipe.id);
      await supabase.from('saved_meals').insert({ recipe_id: recipe.id });
    }
    setSavedIds(next);
  }

  const pantrySet = useMemo(
    () => new Set(pantry.map((p) => normalize(p.ingredient))),
    [pantry]
  );

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
          Anota lo que tienes en casa (sin cantidades) y te proponemos qué puedes cocinar.
        </p>
      </div>

      <form onSubmit={addIngredient} className="flex gap-2 max-w-md">
        <input
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          placeholder="Ej. huevos, arroz, tomate…"
          className="flex-1 border border-line rounded-md px-3 py-2 text-sm bg-white/70 focus:outline-none focus:border-pine"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-pine text-paper text-sm hover:bg-pine2"
        >
          Añadir
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {pantry.map((item) => (
          <span
            key={item.id}
            className="flex items-center gap-2 text-sm bg-white/70 border border-line rounded-full px-3 py-1"
          >
            {item.ingredient}
            <button
              onClick={() => removeIngredient(item)}
              className="text-ink/40 hover:text-paprika"
              aria-label={`Quitar ${item.ingredient}`}
            >
              ×
            </button>
          </span>
        ))}
        {!loading && pantry.length === 0 && (
          <p className="text-sm text-ink/50">
            Tu despensa está vacía. Añade algunos ingredientes para ver sugerencias.
          </p>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-pine">Puedes cocinar</h2>
        {loading ? (
          <p className="text-ink/50 text-sm">Cargando…</p>
        ) : suggestions.length === 0 ? (
          <p className="text-ink/50 text-sm">
            Todavía no hay coincidencias con recetas del recetario.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map(({ recipe, match }) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                saved={savedIds.has(recipe.id)}
                onToggleSave={toggleSave}
                matchInfo={match}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
