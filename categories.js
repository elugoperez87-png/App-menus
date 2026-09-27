// Añadir una categoría nueva (p. ej. "merienda") solo requiere añadirla aquí:
// no hace falta tocar la base de datos porque meal_type es texto libre.
export const MEAL_TYPES = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'comida', label: 'Comida' },
  { key: 'cena', label: 'Cena' },
];

export const MEAL_LABELS = Object.fromEntries(MEAL_TYPES.map((m) => [m.key, m.label]));

export const DIFFICULTIES = [
  { key: 'facil', label: 'Fácil' },
  { key: 'media', label: 'Media' },
  { key: 'dificil', label: 'Difícil' },
];

export const DIFFICULTY_LABELS = Object.fromEntries(DIFFICULTIES.map((d) => [d.key, d.label]));

export const DIFFICULTY_STYLES = {
  facil: 'bg-pine2/15 text-pine2 border-pine2/30',
  media: 'bg-mustard/15 text-mustard border-mustard/40',
  dificil: 'bg-paprika/15 text-paprika border-paprika/30',
};
