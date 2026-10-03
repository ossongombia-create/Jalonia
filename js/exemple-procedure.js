// exemple-procedure.js — L'EXEMPLE de procédure montré à l'utilisateur (menu Fichier › Exemple) : la procédure PR-VEN-01 « Traiter une
// commande client » d'une organisation FICTIVE (« Entreprise Exemple », V0, 01/10/2026), sans aucun rôle externe.
// Rien n'y est propre à une entreprise réelle : l'application sert à toute organisation, et cet exemple ne sert qu'à essayer.
// Il est neutre et facile à remplacer : le sujet est volontairement banal (v0.26).
// Les 11 sections du corps suivent le modèle standard de procédure (v0.11) ; les sections 5, 6 et 9 sont recalculées
// à partir des rôles, des instructions et des risques que maîtrise chaque instruction (bloc « genere »). Les contrôles
// (triangle Q) et les retours vers l'étape 2 sont des suites (alternatives) des instructions concernées : ils apparaissent
// dans la description des activités (section 6). Le texte est volontairement resserré : le document tient en 5 pages.

import { nouvelleProcedure, nouvelleEtape, nouveauRisque, nouvelleAlternative, nouvelleRevision } from "./model.js";

export function exempleProcedure() {
  const p = nouvelleProcedure();
  const charge = { id: "r-charge", nom: "Chargé de clientèle", type: "individuel", service: "Service commercial", responsabilite: "Qualifie les demandes, établit les offres, enregistre les commandes, informe le client, suit sa satisfaction." };
  const logistique = { id: "r-log", nom: "Responsable logistique", type: "individuel", service: "Service logistique", responsabilite: "Vérifie la faisabilité, réserve le stock, prépare et expédie les commandes, archive les dossiers ; tient le registre des commandes." };
  const compta = { id: "r-compta", nom: "Comptable", type: "individuel", service: "Service financier", responsabilite: "Facture les commandes expédiées et suit les règlements." };
  const dg = { id: "r-dg", nom: "Direction", type: "unite", service: "Direction générale", responsabilite: "Valide les commandes qui sortent du cadre habituel (montant, délai, conditions particulières)." };
  p.roles = [charge, logistique, dg, compta];
  p.meta = {
    ...p.meta,
    organisation: "Entreprise Exemple",
    direction: "Ventes et logistique",
    processus: "VEN Vendre et contractualiser",
    pilote: "Responsable commercial",
    typeDocument: "procedure",
    titre: "Traiter une commande client", reference: "PR-VEN-01", version: "V0", niveau: 2,
    domaine: "realisation", dateApplication: "2026-10-01",
    signataires: {
      redige: { nom: "", fonction: "Chargé de clientèle", date: "2026-10-01" },
      verifie: { nom: "", fonction: "Responsable logistique", date: "" },
      approuve: { nom: "", fonction: "Direction", date: "" },
    },
    revisions: [nouvelleRevision({ id: "v1", version: "V0", date: "2026-10-01", nature: "Création initiale du document", auteur: "Responsable commercial" })],
    declencheur: "Demande de prix ou de commande reçue d'un client (téléphone, courriel ou formulaire)",
    fin: "Commande clôturée et dossier archivé, registre EN-VEN-01 à jour (étapes 6 et 10)",
  };
  const e = (champs) => nouvelleEtape(champs);
  p.etapes = [
    e({ roleId: charge.id, libelle: "Qualifier la demande du client", entree: "Demande du client", entreeDe: "client", sortie: "Demande qualifiée", outils: [{ id: "o0", type: "document", nom: "Fiche de demande" }] }),
    e({ roleId: charge.id, libelle: "Établir l'offre", entree: "Demande qualifiée ou offre à ajuster (étapes 3, 5, 9)", sortie: "Offre chiffrée, non engageante tant qu'elle n'est pas validée", versQui: "Responsable logistique", outils: [{ id: "o1", type: "document", nom: "FO-VEN-01" }, { id: "o2", type: "document", nom: "Grille tarifaire" }], risques: [nouveauRisque({ id: "k1", risque: "Prix erroné communiqué au client", causes: "Tarif obsolète, saisie manuelle", gravite: "3", probabilite: "2", mesure: "Tarif unique tenu à jour ; offre relue avant envoi" })] }),
    e({ roleId: logistique.id, libelle: "Vérifier la faisabilité", entree: "Offre chiffrée", entreeDe: "Chargé de clientèle", sortie: "Offre faisable, ou non faisable avec avis motivé (Chargé de clientèle) ; délai 2 jours ouvrés", outils: [{ id: "o3", type: "document", nom: "Tableau de stock" }] }),
    e({ roleId: logistique.id, libelle: "Réserver le stock", entree: "Offre faisable", sortie: "Stock réservé pour la date promise", versQui: "Direction", outils: [{ id: "o4", type: "document", nom: "EN-VEN-01" }] }),
    e({ roleId: dg.id, libelle: "Valider la commande", entree: "Offre faisable, stock réservé", entreeDe: "Responsable logistique", sortie: "Commande validée et signée, ou réserves", versQui: "Chargé de clientèle", outils: [{ id: "o5", type: "document", nom: "Grille de délégation" }] }),
    e({ roleId: charge.id, libelle: "Enregistrer la commande", entree: "Commande validée", sortie: "Commande enregistrée, accusé de réception envoyé au client", outils: [{ id: "o6", type: "document", nom: "EN-VEN-01" }], risques: [nouveauRisque({ id: "k2", risque: "Commande perdue ou saisie en double", causes: "Saisie manuelle, deux canaux de réception", gravite: "3", probabilite: "2", mesure: "Numéro unique par commande ; recherche des doublons à la saisie" })] }),
    e({ roleId: logistique.id, libelle: "Expédier la commande", entree: "Commande enregistrée", sortie: "Marchandise expédiée, bon de livraison émis", versQui: "Comptable", outils: [{ id: "o7", type: "document", nom: "EN-VEN-02" }], risques: [nouveauRisque({ id: "k3", risque: "Livraison à une mauvaise adresse", causes: "Adresse incomplète, saisie erronée", gravite: "3", probabilite: "3", mesure: "Adresse confirmée avec le client ; contrôle avant départ" }), nouveauRisque({ id: "k4", risque: "Marchandise endommagée pendant le transport", causes: "Emballage insuffisant, transporteur", gravite: "4", probabilite: "2", mesure: "Emballage adapté, réserves écrites à la livraison, assurance" })] }),
    e({ roleId: compta.id, libelle: "Facturer la commande", entree: "Marchandise expédiée", sortie: "Facture émise et envoyée", versQui: "Chargé de clientèle" }),
    e({ roleId: charge.id, libelle: "Suivre la satisfaction du client", entree: "Facture émise, retours du client", sortie: "Décision tracée : clôture, nouvelle offre (étape 2) ou litige", risques: [nouveauRisque({ id: "k5", risque: "Réclamation non traitée", causes: "Retour client non remonté", gravite: "3", probabilite: "2", mesure: "Revue hebdomadaire des retours ; réponse sous 5 jours ouvrés" })], outils: [{ id: "o10", type: "document", nom: "Registre des réclamations" }] }),
    e({ roleId: logistique.id, libelle: "Archiver le dossier de commande", entree: "Décision de clôture", sortie: "Dossier archivé et stock à jour", versQui: "Responsable commercial", outils: [{ id: "o8", type: "document", nom: "EN-VEN-01" }], risques: [nouveauRisque({ id: "k6", risque: "Perte d'une preuve de livraison", causes: "Archivage incomplet, durée de conservation mal connue", gravite: "4", probabilite: "1", mesure: "Dossier complet vérifié avant archivage ; aucune élimination avant l'échéance" })] }),
  ];
  const [, s2, s3, , s5, , , , s9] = p.etapes;
  // Contrôles (triangle Q) : exemple de points de contrôle ; « Suite si non conforme » = retour à l'étape 2.
  s3.controle = { actif: true, nature: "Q", critere: "Stock disponible et délai de livraison tenable ; prix cohérent avec la grille tarifaire ; conditions de paiement précisées", enregistrement: "Visa « Faisabilité vérifiée »" };
  s3.condition = "Faisable";
  s3.sortie = "Offre faisable ; délai 2 jours ouvrés";
  s3.alternatives = [nouvelleAlternative({ id: "a1", condition: "Non faisable", info: "Avis motivé", versQui: "Chargé de clientèle", vers: s2.id })];
  s5.controle = { actif: true, nature: "Q", critere: "Conditions commerciales acceptables ; montant dans la limite de la délégation", enregistrement: "Visa « Validé par », registre EN-VEN-01" };
  s5.condition = "Validée";
  s5.sortie = "Commande validée et signée";
  s5.versQui = "Chargé de clientèle";
  s5.alternatives = [nouvelleAlternative({ id: "a2", condition: "Réserves", info: "Réserves formulées", versQui: "Chargé de clientèle", vers: s2.id })];
  // Suivi : trois suites possibles (clôture = suite normale, nouvelle offre = retour à l'étape 2, litige = fin de la procédure).
  s9.condition = "Clôture";
  s9.sortie = "Décision de clôture tracée";
  s9.versQui = "Responsable logistique";
  s9.alternatives = [
    nouvelleAlternative({ id: "a3", condition: "Nouvelle offre", info: "Demande de modification tracée", versQui: "Chargé de clientèle", vers: s2.id }),
    nouvelleAlternative({ id: "a4", condition: "Litige", info: "Litige transmis à la Direction", vers: "fin" }),
  ];
  p.corps = {
    objet: [
      {"id":"b1","type":"p","texte":"Définir comment l'organisation reçoit, vérifie, valide, enregistre, expédie, facture et clôture les commandes de ses clients. La procédure garantit que chaque commande est traitée dans le délai promis, avec le bon prix et la bonne marchandise, et que les preuves de livraison restent disponibles pendant leur durée de conservation."},
    ],
    domaine: [
      {"id":"b2","type":"p","texte":"Toutes les commandes de clients de l'organisation, pour toutes les gammes de produits ou de services et tous les canaux de réception (téléphone, courriel, formulaire, rendez-vous). Elle couvre aussi les offres chiffrées qui précèdent la commande, les livraisons partielles et les réclamations qui suivent. Exclusion : la gestion des appels d'offres publics. La procédure démarre quand une demande de prix ou de commande est reçue d'un client (nouveau client, réapprovisionnement, besoin ponctuel, réponse à une offre, renouvellement d'un contrat)."},
    ],
    references: [
      {"id":"b3","type":"p","texte":"Exigences et documents de référence :"},
      {"id":"b4","type":"tableau","colonnes":["Type","Référence","Intitulé"],"lignes":[["Norme","ISO 9001, § 8.2","Exigences relatives aux produits et services"],["Norme","ISO 9001, § 8.5","Production et prestation de service"],["Réglementation","Conditions générales de vente","Texte en vigueur dans l'organisation"],["Document interne","FO-VEN-01","Modèle d'offre commerciale"],["Document interne","IT-VEN-01","Enregistrer une commande"],["Document interne","Cartographie","Cartographie des processus de l'organisation (codes processus)"]]},
    ],
    definitions: [
      {"id":"b5","type":"p","texte":"Termes et sigles utilisés :"},
      {"id":"b6","type":"tableau","colonnes":["Terme / Sigle","Définition"],"lignes":[["Offre","Proposition chiffrée adressée au client ; elle n'engage l'organisation qu'après validation (étape 5)."],["Commande","Accord du client sur une offre : quantités, prix, délai et conditions de paiement."],["Date promise","Date de livraison annoncée au client dans l'accusé de réception de sa commande."],["Bon de livraison","Document qui accompagne la marchandise et que le client signe à la réception."],["Réserves","Remarques écrites du client ou de la Direction qui conditionnent l'acceptation d'une offre ou d'une livraison."],["Litige","Désaccord persistant avec un client, traité par la Direction hors de cette procédure."],["FP / PR / IT","Fiche processus (niveau 1) / Procédure (niveau 2 : qui fait quoi) / Instruction de travail (niveau 3 : comment faire)."],["FO / EN","Formulaire vierge / Enregistrement."]]},
    ],
    responsabilites: [
      {"id":"b7","type":"p","texte":"Les rôles ci-dessous correspondent aux couloirs du logigramme (section 7)."},
      {"id":"b8","type":"genere"},
      {"id":"b9","type":"p","texte":"Le Responsable commercial pilote la procédure : il suit les indicateurs, anime la revue annuelle et propose les évolutions à la Direction."},
    ],
    description: [
      {"id":"b11","type":"genere"},
      {"id":"b12","type":"p","texte":"6.1 Numérotation et délais"},
      {"id":"b13","type":"p","texte":"Chaque commande porte un numéro unique attribué à l'enregistrement (étape 6) ; il figure sur l'accusé de réception, le bon de livraison et la facture. Une offre est valable 30 jours ; passé ce délai, elle est reprise à l'étape 2. La date promise tient compte du stock réservé et du délai de transport."},
      {"id":"b17","type":"p","texte":"Seuils de validation : une commande dont le montant dépasse la limite de délégation, ou dont les conditions s'écartent des conditions générales de vente, passe par la Direction (étape 5). Les autres commandes sont validées par le Responsable logistique à l'étape 3."},
      {"id":"b18","type":"p","texte":"6.2 Livraison et preuves"},
      {"id":"b19","type":"p","texte":"Le bon de livraison est signé par le client à la réception ; toute réserve y est portée par écrit. Un exemplaire signé est rendu au Responsable logistique, qui le classe au dossier de la commande. Les livraisons partielles sont suivies sur la même commande : le solde reste ouvert jusqu'à la dernière expédition."},
      {"id":"b21","type":"p","texte":"Les dossiers sont conservés dans un emplacement unique (lecteur partagé de l'organisation) ; l'écriture est réservée aux personnes concernées par la commande. L'emplacement est sauvegardé périodiquement et la restauration testée."},
      {"id":"b22","type":"p","texte":"6.3 Réclamations et litiges"},
      {"id":"b23","type":"p","texte":"Toute réclamation reçue est tracée à l'étape 9 et reçoit une réponse sous 5 jours ouvrés. Une demande de modification donne lieu à une nouvelle offre (étape 2). Un désaccord qui persiste est un litige : il est transmis à la Direction, qui le traite hors de cette procédure."},
    ],
    logigramme: [
      {"id":"b24","type":"p","texte":"Cycle de traitement d'une commande client (niveau 2). La légende des symboles figure dans le guide de rédaction de l'organisation."},
    ],
    indicateurs: [
      {"id":"b27","type":"tableau","colonnes":["Indicateur","Mode de calcul","Cible","Fréquence"],"lignes":[["Taux de commandes livrées dans le délai promis","Commandes livrées à la date promise / commandes livrées × 100 (EN-VEN-01 et 02)","≥ 95 %","Mensuelle"],["Délai moyen de traitement","Moyenne (date d'expédition − date de réception de la commande), EN-VEN-01","≤ 3 jours ouvrés","Mensuelle"]]},
      {"id":"b27g","type":"genere"},
    ],
    risques: [
      {"id":"b28","type":"p","texte":"Criticité = gravité × probabilité (1 à 4 chacune), selon le guide de rédaction de l'organisation."},
      {"id":"b28g","type":"genere"},
      {"id":"b29","type":"tableau","colonnes":["Risque associé","Mesure de maîtrise","Acteur responsable"],"lignes":[["Perte de savoir au départ d'une personne clé\nInstructions 1 à 10 · criticité 3 × 2 = 6","Suppléant désigné et formé pour chaque fonction","Direction"]]},
    ],
    enregistrements: [
      {"id":"b30","type":"tableau","colonnes":["Nom du document","Support","Durée de conservation","Lieu d'archivage"],"lignes":[["EN-VEN-01 — Registre des commandes","Numérique (logiciel de gestion), export en secours","10 ans après clôture","Lecteur partagé ventes"],["EN-VEN-02 — Bons de livraison signés","Numérique et papier","10 ans après livraison","Lecteur partagé ventes"],["FO-XXX-NN — Offres et commandes signées","Papier ou numérique","Exigence légale ou contractuelle, 5 ans minimum","Armoires du service, serveur"],["Offres sans suite","Numérique","1 an après l'expiration de l'offre","Lecteur partagé ventes"]]},
    ],
    diffusion: [
      {"id":"b31","type":"p","texte":"Pour action : chargés de clientèle, Responsable logistique, Comptable, Direction. Pour information : ensemble du personnel. Diffusion en PDF sur le lecteur partagé, avec sensibilisation des équipes concernées."},
    ],
  };
  return p;
}
