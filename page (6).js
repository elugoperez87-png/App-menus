'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Esta sección se ha unificado con "Mis recetas" (pestaña Favoritas).
// Se mantiene la ruta para no romper enlaces guardados de la versión anterior.
export default function MisComidasRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/mis-recetas?tab=favoritas');
  }, [router]);
  return <p className="text-ink/50 text-sm">Redirigiendo a Mis recetas…</p>;
}
