// carto-bibliotheque.js — la bibliothèque de 50 cartographies de départ, à charger comme modèle (v1.5).
// Demande de Brice (v1.5) : 50 modèles aux SCHÉMAS DIFFÉRENTS (8 familles de dessin, 6 ou 7 variantes chacune), portés par deux
// organisations fictives : un restaurant et un atelier de fabrication (« Entreprise Exemple »). Avant la v1.5, les 50 modèles étaient
// 50 secteurs sur un même schéma en bandes.
// Chaque variante change visiblement la forme : le sens (normal / alterné) et le nombre de processus par bloc (management,
// réalisation, support, surveillance & mesure). Les flux sont laissés vides (dessin structurel). Données neutres.
//
// Chaque entrée : { organisation, contexte, processus:[{code,nom,categorie}], schema, sens, variante, nbProcessus }.

// Les deux organisations : les processus de chaque bloc, du plus courant au plus spécifique (une variante en prend les premiers).
const ORGANISATIONS = {
  restaurant: {
    organisation: "Entreprise Exemple — restaurant",
    management: [["PIL", "Piloter le restaurant"], ["AME", "Améliorer la qualité & l'hygiène"], ["STR", "Définir l'offre & la carte"]],
    realisation: [["RES", "Gérer les réservations"], ["ACC", "Accueillir & placer le client"], ["CMD", "Prendre la commande"], ["CUI", "Cuisiner les plats"],
      ["SER", "Servir les plats"], ["ENC", "Encaisser & facturer"], ["EMP", "Préparer la vente à emporter"]],
    support: [["APP", "Approvisionner & gérer les stocks"], ["RH", "Gérer le personnel"], ["MAI", "Entretenir les locaux & le matériel"], ["SI", "Gérer le système d'information"]],
    verification: [["SMS", "Surveiller l'hygiène & la satisfaction"], ["AUD", "Auditer & mesurer"]],
  },
  atelier: {
    organisation: "Entreprise Exemple — atelier de fabrication",
    management: [["DIR", "Diriger l'entreprise"], ["AMC", "Améliorer en continu"], ["STR", "Planifier la stratégie"]],
    realisation: [["COM", "Vendre & établir les offres"], ["ETU", "Concevoir & industrialiser"], ["PLA", "Planifier la production"], ["FAB", "Fabriquer les pièces"],
      ["ASS", "Assembler & tester"], ["EXP", "Conditionner & expédier"], ["SAV", "Assurer le service après-vente"]],
    support: [["ACH", "Acheter & suivre les fournisseurs"], ["MAI", "Maintenir les équipements"], ["RH", "Gérer les compétences"], ["LOG", "Gérer les stocks & la logistique"]],
    verification: [["CTL", "Contrôler & mesurer"], ["AUD", "Auditer le système"]],
  },
};

// Les 8 familles de schémas et leur nombre de variantes (2 × 7 + 6 × 6 = 50).
const FAMILLES = [["bandes", 7], ["chaine", 7], ["maison", 6], ["roue", 6], ["colonnes", 6], ["client", 6], ["serpentin", 6], ["etoile", 6]];

// Effectifs par variante (index 0 à 6) : management, réalisation, support, surveillance & mesure. Le sens alterne d'une variante à l'autre.
// Les 7 combinaisons sont toutes différentes : deux variantes d'une même famille ne se ressemblent jamais.
const VARIANTES = [
  { m: 1, r: 3, s: 2, v: 1 },
  { m: 2, r: 4, s: 3, v: 0 },
  { m: 2, r: 5, s: 4, v: 1 },
  { m: 1, r: 6, s: 3, v: 0 },
  { m: 3, r: 7, s: 4, v: 2 },
  { m: 2, r: 4, s: 2, v: 2 },
  { m: 1, r: 5, s: 3, v: 0 },
];

function modele(schema, i) {
  const n = VARIANTES[i];
  const cle = i % 2 === 0 ? "restaurant" : "atelier"; // variantes impaires (1, 3, 5, 7) : restaurant ; paires : atelier
  const org = ORGANISATIONS[cle];
  const prendre = (categorie, nb) => org[categorie].slice(0, nb).map(([code, nom]) => ({ code, nom, categorie }));
  const processus = [...prendre("management", n.m), ...prendre("realisation", n.r), ...prendre("support", n.s), ...prendre("verification", n.v)];
  return { organisation: org.organisation, contexte: "", processus, schema, sens: i % 2 === 0 ? "normal" : "alterne", variante: i + 1, nbProcessus: processus.length };
}

export const BIBLIOTHEQUE = FAMILLES.flatMap(([schema, nb]) => Array.from({ length: nb }, (_, i) => modele(schema, i)));
