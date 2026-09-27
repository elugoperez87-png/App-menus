'use client';

import { useState } from 'react';
import Image from 'next/image';
import DifficultyBadge from './DifficultyBadge';

export default function SuggestionCard({ suggestion, onImport, onDismiss, imported }) {
  const [mealType, setMealType] = useState(suggestion.meal_type);
  const [importing, setImporting] = useState(false);

  async function handleImport() {
    setImporting(true);
    await onImport(suggestion, mealType);
    setImporting(false);
  }

  return (
    <div className="border border-line border-dashed rounded-lg bg-white/50 overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] bg-ink/5">
        {suggestion.image_url && (
          <Image
            src={suggestion.image_url}
            alt={suggestion.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
        )}
        <span className="absolute top-2 left-2 text-[11px] uppercase tracking-wide bg-paper/90 text-ink/70 px-2 py-0.5 rounded">
          Sugerencia web
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-lg leading-snug text-ink">{suggestion.title}</h3>
        <p className="text-xs text-ink/40">
          {suggestion.category}
          {suggestion.country ? ` · cocina ${suggestion.country}` : ''} · texto original en
          inglés
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={suggestion.difficulty} />
          <span className="text-xs text-ink/50">~{suggestion.time_minutes} min (estimado)</span>
        </div>

        <p className="text-xs text-ink/50">{suggestion.ingredients.length} ingredientes</p>

        <div className="mt-auto pt-2 flex flex-col gap-2">
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="text-sm border border-line rounded-md px-2 py-1.5 bg-white/70"
          >
            <option value="desayuno">Desayuno</option>
            <option value="comida">Comida</option>
            <option value="cena">Cena</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleImport}
              disabled={importing || imported}
              className={`flex-1 text-sm px-3 py-2 rounded-md border transition-colors ${
                imported
                  ? 'bg-pine text-paper border-pine cursor-default'
                  : 'border-pine text-pine hover:bg-pine hover:text-paper disabled:opacity-50'
              }`}
            >
              {imported ? 'Añadida ✓' : importing ? 'Añadiendo…' : 'Añadir a mis recetas'}
            </button>
            {onDismiss && !imported && (
              <button
                onClick={() => onDismiss(suggestion)}
                title="No me interesa"
                className="text-sm px-3 py-2 rounded-md border border-line text-ink/40 hover:text-paprika hover:border-paprika/40"
              >
                ✕
              </button>
            )}
          </div>

          {suggestion.source_url && (
            <a
              href={suggestion.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-ink/40 hover:text-ink/70 underline self-start"
            >
              Ver receta original
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
