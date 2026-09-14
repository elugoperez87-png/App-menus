'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import DifficultyBadge from '../../../components/DifficultyBadge';
import { MEAL_LABELS } from '../../../lib/matching';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    const { data: recipeData } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    const { data: savedData } = await supabase
      .from('saved_meals')
      .select('recipe_id')
      .eq('recipe_id', id)
      .maybeSingle();

    setRecipe(recipeData);
    setSaved(!!savedData);
    setLoading(false);
  }

  async function toggleSave() {
    if (saved) {
      setSaved(false);
      await supabase.from('saved_meals').delete().eq('recipe_id', id);
    } else {
      setSaved(true);
      await supabase.from('saved_meals').insert({ recipe_id: id });
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta receta? Esta acción no se puede deshacer.')) return;
    await supabase.from('recipes').delete().eq('id', id);
    router.push('/');
  }

  if (loading) return <p className="text-ink/50 text-sm">Cargando receta…</p>;
  if (!recipe) return <p className="text-ink/50 text-sm">No se encontró esta receta.</p>;

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-ink/50 hover:text-ink self-start"
      >
        ← Volver
      </button>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-ink/5">
          {recipe.image_url && (
            <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover" />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wide text-ink/50">
            {MEAL_LABELS[recipe.meal_type] || recipe.meal_type}
          </span>
          <h1 className="font-display text-3xl text-ink leading-tight">{recipe.title}</h1>

          <div className="flex items-center gap-3">
            <DifficultyBadge difficulty={recipe.difficulty} />
            <span className="text-sm text-ink/60">{recipe.time_minutes} min</span>
          </div>

          <button
            onClick={toggleSave}
            className={`mt-2 text-sm px-4 py-2 rounded-md border self-start transition-colors ${
              saved
                ? 'bg-pine text-paper border-pine hover:bg-pine2'
                : 'border-pine text-pine hover:bg-pine hover:text-paper'
            }`}
          >
            {saved ? 'En mi lista ✓' : 'Añadir a mi lista'}
          </button>

          <div>
            <h2 className="font-display text-lg text-ink mb-2">Ingredientes</h2>
            <ul className="list-disc list-inside text-sm text-ink/80 space-y-1">
              {(recipe.ingredients || []).map((ing) => (
                <li key={ing}>{ing}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg text-ink mb-2">Preparación</h2>
        <div className="text-sm text-ink/80 whitespace-pre-line leading-relaxed max-w-2xl">
          {recipe.steps}
        </div>
      </div>

      {recipe.is_custom && (
        <button
          onClick={handleDelete}
          className="text-xs text-paprika/80 hover:text-paprika self-start mt-4"
        >
          Eliminar receta
        </button>
      )}
    </div>
  );
}
