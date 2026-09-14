'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import RecipeCard from '../../components/RecipeCard';
import { MEAL_LABELS } from '../../lib/matching';

export default function MisComidasPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('saved_meals')
      .select('recipe_id, recipes(*)')
      .order('created_at', { ascending: false });

    setRecipes((data || []).map((row) => row.recipes).filter(Boolean));
    setLoading(false);
  }

  async function removeFromList(recipe) {
    setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    await supabase.from('saved_meals').delete().eq('recipe_id', recipe.id);
  }

  const grouped = recipes.reduce((acc, r) => {
    acc[r.meal_type] = acc[r.meal_type] || [];
    acc[r.meal_type].push(r);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Mi lista de comidas</h1>
        <p className="text-ink/60 text-sm">Las recetas que has ido guardando para cocinar.</p>
      </div>

      {loading ? (
        <p className="text-ink/50 text-sm">Cargando…</p>
      ) : recipes.length === 0 ? (
        <p className="text-ink/50 text-sm">
          Todavía no has añadido ninguna receta. Ve al recetario y pulsa &quot;Añadir a mi
          lista&quot;.
        </p>
      ) : (
        Object.entries(grouped).map(([mealType, list]) => (
          <section key={mealType} className="flex flex-col gap-3">
            <h2 className="font-display text-xl text-pine">
              {MEAL_LABELS[mealType] || mealType}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  saved={true}
                  onToggleSave={removeFromList}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
