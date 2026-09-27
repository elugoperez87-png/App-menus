'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import DifficultyBadge from '../../../components/DifficultyBadge';
import { MEAL_LABELS } from '../../../lib/categories';
import { AREA_FLAGS } from '../../../lib/mealdb';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('recipes').select('*').eq('id', id).single();
    setRecipe(data);
    setLoading(false);
  }

  async function toggleFavorite() {
    const next = !recipe.is_favorite;
    setRecipe((prev) => ({ ...prev, is_favorite: next }));
    await supabase.from('recipes').update({ is_favorite: next }).eq('id', id);
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta receta? Esta acción no se puede deshacer.')) return;
    await supabase.from('recipes').delete().eq('id', id);
    router.push('/mis-recetas');
  }

  if (loading) return <p className="text-ink/50 text-sm">Cargando receta…</p>;
  if (!recipe) return <p className="text-ink/50 text-sm">No se encontró esta receta.</p>;

  const nutrition = recipe.nutrition || null;

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
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-ink/50">
              {MEAL_LABELS[recipe.meal_type] || recipe.meal_type}
            </span>
            <button
              onClick={toggleFavorite}
              aria-label={recipe.is_favorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
              className={`text-2xl leading-none ${
                recipe.is_favorite ? 'text-paprika' : 'text-ink/25 hover:text-paprika'
              }`}
            >
              {recipe.is_favorite ? '♥' : '♡'}
            </button>
          </div>

          <h1 className="font-display text-3xl text-ink leading-tight">{recipe.title}</h1>

          <div className="flex items-center gap-3 flex-wrap">
            <DifficultyBadge difficulty={recipe.difficulty} />
            <span className="text-sm text-ink/60">{recipe.time_minutes} min</span>
            {recipe.servings && (
              <span className="text-sm text-ink/60">{recipe.servings} raciones</span>
            )}
            {recipe.country && (
              <span className="text-sm text-ink/60">
                {AREA_FLAGS[recipe.country] || '🍽️'} {recipe.country}
              </span>
            )}
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-ink/5 text-ink/60 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {recipe.is_custom && (
            <Link
              href={`/receta/${id}/editar`}
              className="text-sm px-4 py-2 rounded-md border border-pine text-pine hover:bg-pine hover:text-paper self-start"
            >
              Editar receta
            </Link>
          )}

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

      {nutrition && (
        <div>
          <h2 className="font-display text-lg text-ink mb-2">Información nutricional</h2>
          <div className="flex gap-4 text-sm text-ink/70">
            {nutrition.calories && <span>{nutrition.calories} kcal</span>}
            {nutrition.protein_g && <span>{nutrition.protein_g} g proteína</span>}
            {nutrition.carbs_g && <span>{nutrition.carbs_g} g carbohidratos</span>}
            {nutrition.fat_g && <span>{nutrition.fat_g} g grasa</span>}
          </div>
        </div>
      )}

      {recipe.source_url && (
        <a
          href={recipe.source_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-ink/40 hover:text-ink/70 underline self-start"
        >
          Ver receta original
        </a>
      )}

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
