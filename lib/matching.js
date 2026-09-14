// Normaliza un texto de ingrediente para comparar sin importar mayúsculas,
// tildes o espacios extra.
export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Dado un array de ingredientes de la despensa (strings) y una receta con
// receta.ingredients (array de strings), devuelve cuántos ingredientes de la
// receta ya tienes y cuáles te faltan.
export function matchRecipe(pantrySet, recipeIngredients) {
  const tienes = [];
  const faltan = [];

  recipeIngredients.forEach((ing) => {
    const norm = normalize(ing);
    const enDespensa = [...pantrySet].some(
      (p) => norm.includes(p) || p.includes(norm)
    );
    if (enDespensa) {
      tienes.push(ing);
    } else {
      faltan.push(ing);
    }
  });

  return {
    tienes,
    faltan,
    total: recipeIngredients.length,
    porcentaje: recipeIngredients.length
      ? Math.round((tienes.length / recipeIngredients.length) * 100)
      : 0,
  };
}

export const MEAL_LABELS = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  cena: 'Cena',
};

export const DIFFICULTY_LABELS = {
  facil: 'Fácil',
  media: 'Media',
  dificil: 'Difícil',
};

export const DIFFICULTY_STYLES = {
  facil: 'bg-pine2/15 text-pine2 border-pine2/30',
  media: 'bg-mustard/15 text-mustard border-mustard/40',
  dificil: 'bg-paprika/15 text-paprika border-paprika/30',
};
