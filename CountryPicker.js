'use client';

import { AREA_FLAGS } from '../lib/mealdb';

export default function CountryPicker({ areas, selected, onSelect, loading }) {
  if (loading) return <p className="text-ink/50 text-sm">Cargando países…</p>;

  return (
    <div className="flex gap-2 flex-wrap">
      {areas.map((area) => (
        <button
          key={area}
          onClick={() => onSelect(area)}
          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
            selected === area
              ? 'bg-ink text-paper border-ink'
              : 'border-line text-ink/60 hover:border-ink/40'
          }`}
        >
          {AREA_FLAGS[area] || '🍽️'} {area}
        </button>
      ))}
    </div>
  );
}
