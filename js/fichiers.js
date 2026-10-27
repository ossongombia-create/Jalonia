// fichiers.js — la règle commune à tous les imports (projet .json, cartographie .json ou .pdf, Word .docx) : le fichier doit
// avoir la bonne extension et ne pas dépasser sa taille maximale. Le contenu, lui, est toujours vérifié et nettoyé ensuite
// par le module qui le lit (store.js, cartographie.js, importWord.js, cartographie-pdf.js) : l'extension n'est qu'un premier filtre.

export const TAILLE_MAX_JSON = 2_000_000;
export const TAILLE_MAX_WORD = 10_000_000;

export function fichierAcceptable(fichier, { extension, tailleMax }) {
  if (!fichier || typeof fichier.name !== "string" || typeof fichier.size !== "number") return false;
  if (fichier.size <= 0 || fichier.size > tailleMax) return false;
  return fichier.name.toLowerCase().endsWith("." + extension);
}
