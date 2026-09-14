'use client';

import Link from 'next/link';
import Image from 'next/image';
import DifficultyBadge from './DifficultyBadge';
import { MEAL_LABELS } from '../lib/matching';

export default function RecipeCard({ recipe, saved, onToggleSave, matchInfo }) {
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
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/receta/${recipe.id}`}>
          <h3 className="font-display text-lg leading-snug text-ink hover:text-pine transition-colors">
            {recipe.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={recipe.difficulty} />
          <span className="text-xs text-ink/50">{recipe.time_minutes} min</span>
          {matchInfo && (
            <span className="text-xs text-pine2 font-medium">
              Tienes {matchInfo.tienes.length}/{matchInfo.total} ingredientes
            </span>
          )}
        </div>

        {matchInfo && matchInfo.faltan.length > 0 && (
          <p className="text-xs text-ink/50">
            Te falta: {matchInfo.faltan.join(', ')}
          </p>
        )}

        <div className="mt-auto pt-2">
          <button
            onClick={() => onToggleSave(recipe)}
            className={`w-full text-sm px-3 py-2 rounded-md border transition-colors ${
              saved
                ? 'bg-pine text-paper border-pine hover:bg-pine2'
                : 'border-pine text-pine hover:bg-pine hover:text-paper'
            }`}
          >
            {saved ? 'En mi lista ✓' : 'Añadir a mi lista'}
          </button>
        </div>
      </div>
    </div>
  );
}
