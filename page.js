'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import RecipeCard from '../components/RecipeCard';

export default function InicioPage() {
  const [recent, setRecent] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [pantryCount, setPantryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: recentData }, { data: favData }, { count }] = await Promise.all([
      supabase.from('recipes').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('recipes').select('*').eq('is_favorite', true).limit(3),
      supabase.from('pantry_items').select('*', { count: 'exact', head: true }),
    ]);
    setRecent(recentData || []);
    setFavorites(favData || []);
    setPantryCount(count || 0);
    setLoading(false);
  }

  async function toggleFavorite(recipe, list, setList) {
    const next = !recipe.is_favorite;
    setList((prev) => prev.map((r) => (r.id === recipe.id ? { ...r, is_favorite: next } : r)));
    await supabase.from('recipes').update({ is_favorite: next }).eq('id', recipe.id);
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">¿Qué se cocina hoy?</h1>
        <p className="text-ink/60 text-sm">Tu asistente de cocina: gestiona, descubre y crea recetas con ayuda de IA.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction href="/descubrir" label="Sugerir recetas" icon="🔎" />
        <QuickAction href="/descubrir" label="Por país" icon="🌍" />
        <QuickAction
          href="/despensa"
          label={`Mi despensa${pantryCount ? ` (${pantryCount})` : ''}`}
          icon="🧺"
        />
        <QuickAction href="/nueva-receta" label="Nueva receta" icon="✏️" />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-pine">Recetas recientes</h2>
          <Link href="/mis-recetas" className="text-sm text-ink/50 hover:text-ink underline">
            Ver todas
          </Link>
        </div>
        {loading ? (
          <p className="text-ink/50 text-sm">Cargando…</p>
        ) : recent.length === 0 ? (
          <p className="text-ink/50 text-sm">
            Aún no tienes recetas.{' '}
            <Link href="/descubrir" className="underline">
              Descubre algunas
            </Link>{' '}
            o crea la tuya.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onToggleFavorite={(recipe) => toggleFavorite(recipe, recent, setRecent)}
              />
            ))}
          </div>
        )}
      </section>

      {favorites.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-pine">Tus favoritas</h2>
            <Link href="/mis-recetas?tab=favoritas" className="text-sm text-ink/50 hover:text-ink underline">
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onToggleFavorite={(recipe) => toggleFavorite(recipe, favorites, setFavorites)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="border border-line rounded-lg p-5 bg-mustard/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-ink">¿Qué puedo cocinar con lo que tengo?</h2>
          <p className="text-sm text-ink/60">
            Anota tu despensa y te decimos qué recetas puedes preparar ya mismo.
          </p>
        </div>
        <Link
          href="/despensa"
          className="text-sm px-4 py-2.5 rounded-md bg-pine text-paper hover:bg-pine2 shrink-0"
        >
          Ir a mi despensa
        </Link>
      </section>
    </div>
  );
}

function QuickAction({ href, label, icon }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 border border-line rounded-lg py-4 px-2 text-center bg-white/50 hover:bg-white/80 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs text-ink/70 font-medium">{label}</span>
    </Link>
  );
}
