// Normaliza un texto de ingrediente para comparar sin importar mayúsculas,
// tildes o espacios extra.
export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Dado un set de ingredientes de la despensa (ya normalizados) y un array de
// ingredientes de una receta, devuelve cuáles ya tienes y cuáles te faltan.
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
