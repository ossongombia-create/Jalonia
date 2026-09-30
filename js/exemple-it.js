// exemple-it.js — L'EXEMPLE d'instruction de travail montré à l'utilisateur : « Réceptionner une livraison » (IT-ACH-01), dans une
// organisation FICTIVE (« Entreprise Exemple »). Un rôle (Magasinier), 7 opérations, des contrôles Oui/Non et des actions correctives
// (fig. 7.7 du livre : une même corrective peut répondre à plusieurs contrôles de la même opération). Les libellés respectent les
// règles du chapitre 7 : opération de 5 mots au plus, à l'infinitif, sans « et » ; contrôle sous forme de question ; corrective à l'infinitif.
// Rien n'y est propre à une entreprise réelle : l'exemple ne sert qu'à essayer.

import { nouvelleProcedure, nouvelleOperation, nouveauControle, nouvelleCorrective } from "./model.js";

export function exempleInstruction() {
  const p = nouvelleProcedure();
  p.meta = {
    ...p.meta,
    organisation: "Entreprise Exemple",
    direction: "Logistique",
    processus: "ACH Acheter et gérer les stocks",
    pilote: "Responsable logistique",
    typeDocument: "instruction",
    titre: "Réceptionner une livraison", reference: "IT-ACH-01", version: "V0", niveau: 3,
    domaine: "support", dateApplication: "2026-09-30",
    declencheur: "À chaque arrivée d'une livraison au magasin",
    fin: "Livraison acceptée et articles rangés, réception enregistrée",
    amont: { texte: "Passer la commande au fournisseur", role: "Acheteur", information: "Commande confirmée" },
    aval: { texte: "Régler la facture du fournisseur", role: "Comptable", information: "Bon de réception signé" },
  };
  p.meta.signataires.redige.nom = "Responsable logistique";
  p.it.role = { nom: "Magasinier" };
  const doc = (id, nom) => ({ id, type: "document", nom });
  const mat = (id, nom) => ({ id, type: "materiel", nom });
  const o = (champs) => nouvelleOperation(champs);
  const c = (champs) => nouveauControle(champs);
  const m = (champs) => nouvelleCorrective(champs);
  p.it.operations = [
    o({
      id: "p1", libelle: "Vérifier le bon de livraison", entree: "Livraison arrivée", sortie: "Bon de livraison conforme",
      outils: [doc("o1", "Bon de commande")],
      correctives: [m({ id: "m1", libelle: "Alerter l'acheteur" })],
      controles: [c({ id: "c1", question: "Références et quantités conformes à la commande ?", nature: "Q", correctives: ["m1"] })],
    }),
    o({
      id: "p2", libelle: "Inspecter l'état des colis", vigilance: true, outils: [mat("o2", "Cutter de sécurité")],
      correctives: [m({ id: "m2", libelle: "Émettre des réserves" })],
      controles: [c({ id: "c2", question: "Emballages intacts et secs ?", nature: "Q", correctives: ["m2"] })],
    }),
    o({
      id: "p3", libelle: "Compter les articles",
      correctives: [m({ id: "m3", libelle: "Noter l'écart constaté" })],
      controles: [c({ id: "c3", question: "Quantité reçue égale à la quantité commandée ?", nature: "Q", correctives: ["m3"] })],
    }),
    o({
      id: "p4", libelle: "Contrôler la qualité des articles", vigilance: true,
      correctives: [m({ id: "m4", libelle: "Isoler les articles refusés" })],
      controles: [c({ id: "c4", question: "Articles conformes aux spécifications ?", nature: "Q", correctives: ["m4"] })],
    }),
    o({
      id: "p5", libelle: "Vérifier les produits dangereux", sortie: "Produits dangereux conformes", vigilance: true,
      outils: [doc("o3", "Fiche de données de sécurité")],
      correctives: [m({ id: "m5", libelle: "Réclamer la fiche au fournisseur" })],
      controles: [
        c({ id: "c5", question: "Étiquetage lisible et complet ?", nature: "S", correctives: ["m5"] }),
        c({ id: "c6", question: "Fiche de données de sécurité fournie ?", nature: "R", correctives: ["m5"] }),
      ],
    }),
    o({
      id: "p6", libelle: "Enregistrer la réception", sortie: "Bon de réception signé", enregistrement: true,
      contrainte: { actif: true, nature: "delai", texte: "24 h au plus" }, outils: [doc("o4", "Fiche de réception FO-ACH-02")],
    }),
    o({ id: "p7", libelle: "Ranger les articles", sortie: "Articles rangés en stock" }),
  ];
  return p;
}
