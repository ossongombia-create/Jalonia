// stockage.js — ce que l'outil garde dans le navigateur (localStorage) : écrire en sachant si l'écriture a réussi,
// et tout effacer d'un coup (droit à l'effacement). Aucune donnée ne quitte le navigateur.
//
// Toutes les clés de l'outil commencent par PREFIXE : c'est ce qui permet de les retrouver et de les effacer sans toucher
// aux données d'autres sites. Une écriture qui échoue (stockage plein, désactivé, navigation privée stricte) est signalée
// aux abonnés : l'écran prévient alors que le brouillon n'est plus gardé (avant la v1.6, l'échec passait inaperçu).

export const PREFIXE = "qualigramme-app";

let echec = false;
const abonnes = new Set();

function signaler(enEchec) {
  if (enEchec === echec) return;
  echec = enEchec;
  abonnes.forEach((fn) => fn(echec));
}

// Écrit une valeur ; renvoie true si le navigateur l'a gardée.
export function ecrire(cle, valeur) {
  try {
    globalThis.localStorage.setItem(cle, valeur);
    signaler(false);
    return true;
  } catch (e) {
    signaler(true);
    return false;
  }
}

export const stockageEnEchec = () => echec;
export function abonnerStockage(fn) {
  abonnes.add(fn);
  return () => abonnes.delete(fn);
}

// Les clés « de travail » (brouillon du document, cartographie) : celles qu'un autre onglet peut écraser.
export const estCleDeTravail = (cle) => typeof cle === "string" && /^qualigramme-app-(brouillon|enregistre|modifie|cartographie)/.test(cle);

// Les clés de l'outil présentes dans un stockage (localStorage par défaut).
export function clesOutil(stockage = globalThis.localStorage) {
  const cles = [];
  for (let i = 0; i < stockage.length; i += 1) {
    const cle = stockage.key(i);
    if (typeof cle === "string" && cle.startsWith(PREFIXE)) cles.push(cle);
  }
  return cles;
}

// Efface tout ce que l'outil garde dans ce navigateur ; renvoie le nombre de clés effacées (0 si le stockage est inaccessible).
export function effacerDonneesLocales(stockage = globalThis.localStorage) {
  try {
    const cles = clesOutil(stockage);
    cles.forEach((cle) => stockage.removeItem(cle));
    return cles.length;
  } catch (e) {
    return 0;
  }
}
