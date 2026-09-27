'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function PerfilPage() {
  const [aiConfigured, setAiConfigured] = useState(null);
  const [stats, setStats] = useState({ recipes: 0, custom: 0, favorites: 0, pantry: 0 });

  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((d) => setAiConfigured(d.configured))
      .catch(() => setAiConfigured(false));

    Promise.all([
      supabase.from('recipes').select('*', { count: 'exact', head: true }),
      supabase.from('recipes').select('*', { count: 'exact', head: true }).eq('is_custom', true),
      supabase.from('recipes').select('*', { count: 'exact', head: true }).eq('is_favorite', true),
      supabase.from('pantry_items').select('*', { count: 'exact', head: true }),
    ]).then(([recipes, custom, favorites, pantry]) => {
      setStats({
        recipes: recipes.count || 0,
        custom: custom.count || 0,
        favorites: favorites.count || 0,
        pantry: pantry.count || 0,
      });
    });
  }, []);

  return (
    <div className="max-w-xl flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Perfil</h1>
        <p className="text-ink/60 text-sm">
          App de uso personal, sin inicio de sesión: todo lo que ves aquí vive en tu propio
          proyecto de Supabase.
        </p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Recetas" value={stats.recipes} />
        <Stat label="Propias" value={stats.custom} />
        <Stat label="Favoritas" value={stats.favorites} />
        <Stat label="En despensa" value={stats.pantry} />
      </section>

      <section className="border border-line rounded-lg p-4 bg-white/50 flex flex-col gap-2">
        <h2 className="font-display text-lg text-ink">Inteligencia artificial</h2>
        {aiConfigured === null ? (
          <p className="text-sm text-ink/50">Comprobando…</p>
        ) : aiConfigured ? (
          <p className="text-sm text-pine2">✓ Configurada. Ya puedes generar y adaptar recetas con IA.</p>
        ) : (
          <div className="text-sm text-ink/70 flex flex-col gap-1">
            <p>⚠️ No configurada todavía.</p>
            <p>
              Añade la variable de entorno <code className="bg-ink/5 px-1 rounded">ANTHROPIC_API_KEY</code>{' '}
              en Vercel (Project Settings → Environment Variables) y vuelve a desplegar. Puedes
              elegir el modelo con la variable opcional <code className="bg-ink/5 px-1 rounded">AI_MODEL</code>.
            </p>
          </div>
        )}
      </section>

      <section className="text-xs text-ink/40">
        Consulta el README del proyecto para instrucciones completas de instalación,
        variables de entorno y despliegue.
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-line rounded-lg p-3 text-center bg-white/50">
      <div className="font-display text-2xl text-pine">{value}</div>
      <div className="text-xs text-ink/50">{label}</div>
    </div>
  );
}
