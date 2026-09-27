'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import RecipeForm from '../../../../components/RecipeForm';

export default function EditarRecetaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setRecipe(data);
        }
        setLoading(false);
      });
  }, [id]);

  async function handleUpdate(payload) {
    const { error } = await supabase.from('recipes').update(payload).eq('id', id);
    if (error) throw new Error(error.message);
    router.push(`/receta/${id}`);
  }

  if (loading) return <p className="text-ink/50 text-sm">Cargando receta…</p>;
  if (notFound) return <p className="text-ink/50 text-sm">No se encontró esta receta.</p>;
  if (!recipe.is_custom)
    return (
      <p className="text-ink/50 text-sm">
        Esta receta viene de una fuente externa y no se puede editar directamente. Puedes
        duplicarla creando una receta nueva a partir de ella.
      </p>
    );

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Editar receta</h1>
        <p className="text-ink/60 text-sm">Los cambios solo se guardan al pulsar "Guardar cambios".</p>
      </div>
      <RecipeForm initialValues={recipe} onSubmit={handleUpdate} submitLabel="Guardar cambios" />
    </div>
  );
}
