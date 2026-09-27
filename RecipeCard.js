'use client';

import Link from 'next/link';
import Image from 'next/image';
import DifficultyBadge from './DifficultyBadge';
import { MEAL_LABELS } from '../lib/categories';
import { AREA_FLAGS } from '../lib/mealdb';

export default function RecipeCard({ recipe, onToggleFavorite, matchInfo, showEdit = true }) {
  return (
    <div className="border border-line rounded-lg bg-white/60 overflow-hidden flex flex-col">
      <Link href={`/receta/${recipe.id}`} className="block relative aspect-[4/3] bg-ink/5">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 font-display text-3xl">
            {recipe.title.slice(0, 1)}
          </div>
        )}
        <span className="absolute top-2 left-2 text-[11px] uppercase tracking-wide bg-paper/90 text-ink/70 px-2 py-0.5 rounded">
          {MEAL_LABELS[recipe.meal_type] || recipe.meal_type}
        </span>
        {recipe.ai_generated && (
          <span className="absolute top-2 right-2 text-[11px] bg-mustard/90 text-ink px-2 py-0.5 rounded">
            ✨ IA
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/receta/${recipe.id}`}>
            <h3 className="font-display text-lg leading-snug text-ink hover:text-pine transition-colors">
              {recipe.title}
            </h3>
          </Link>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(recipe)}
              aria-label={recipe.is_favorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
              className={`text-lg leading-none shrink-0 ${
                recipe.is_favorite ? 'text-paprika' : 'text-ink/25 hover:text-paprika'
              }`}
            >
              {recipe.is_favorite ? '♥' : '♡'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={recipe.difficulty} />
          <span className="text-xs text-ink/50">{recipe.time_minutes} min</span>
          {recipe.country && (
            <span className="text-xs text-ink/50">
              {AREA_FLAGS[recipe.country] || '🍽️'} {recipe.country}
            </span>
          )}
          {matchInfo && (
            <span className="text-xs text-pine2 font-medium">
              Tienes {matchInfo.tienes.length}/{matchInfo.total} ingredientes
            </span>
          )}
        </div>

        {matchInfo && matchInfo.faltan.length > 0 && (
          <p className="text-xs text-ink/50">Te falta: {matchInfo.faltan.join(', ')}</p>
        )}

        {showEdit && recipe.is_custom && (
          <Link
            href={`/receta/${recipe.id}/editar`}
            className="text-xs text-ink/40 hover:text-ink/70 underline mt-auto pt-1 self-start"
          >
            Editar
          </Link>
        )}
      </div>
    </div>
  );
}
