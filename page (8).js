'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import RecipeForm from '../../components/RecipeForm';

export default function NuevaRecetaPage() {
  const router = useRouter();

  async function handleCreate(payload) {
    const { data, error } = await supabase
      .from('recipes')
      .insert({ ...payload, is_custom: true })
      .select()
      .single();

    if (error) throw new Error(error.message);
    router.push(`/receta/${data.id}`);
  }

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Añadir receta</h1>
        <p className="text-ink/60 text-sm">Guarda una receta tuya para tenerla siempre a mano.</p>
      </div>
      <RecipeForm onSubmit={handleCreate} submitLabel="Guardar receta" />
    </div>
  );
}
