// exemple-procedure.js — L'EXEMPLE de procédure montré à l'utilisateur (menu Fichier › Exemple) : la procédure PR-QUA-01 « Gestion des
// informations documentées » d'une organisation FICTIVE (« Entreprise Exemple », V0, 25/09/2026), sans aucun rôle externe.
// Rien n'y est propre à une entreprise réelle : l'application sert à toute organisation, et cet exemple ne sert qu'à essayer.
// Les 11 sections du corps suivent le modèle standard de procédure (v0.11) ; les sections 5, 6 et 9 sont recalculées
// à partir des rôles, des instructions et des risques que maîtrise chaque instruction (bloc « genere »). Les contrôles
// (triangle Q) et les retours vers l'étape 2 sont des suites (alternatives) des instructions concernées : ils apparaissent
// dans la description des activités (section 6). Le texte est volontairement resserré : le document tient en 5 pages.

import { nouvelleProcedure, nouvelleEtape, nouveauRisque, nouvelleAlternative, nouvelleRevision } from "./model.js";

export function exempleProcedure() {
  const p = nouvelleProcedure();
  const pilote = { id: "r-pilote", nom: "Pilote de processus", type: "individuel", service: "Service du processus concerné", responsabilite: "Identifie le besoin, rédige et met à jour les documents de son processus, les révise au besoin." };
  const qualite = { id: "r-qualite", nom: "Responsable qualité", type: "individuel", service: "Service qualité", responsabilite: "Administrateur documentaire : vérifie, codifie, enregistre, diffuse et retire les documents ; tient les registres, les fichiers maîtres et la liste de veille des documents externes." };
  const dg = { id: "r-dg", nom: "Direction", type: "unite", service: "Direction", responsabilite: "Approuve les documents (ou autorité déléguée)." };
  const util = { id: "r-util", nom: "Utilisateurs", type: "individuel", service: "Tous services", responsabilite: "Appliquent la version en vigueur ; remontent les écarts et suggestions au pilote." };
  p.roles = [pilote, qualite, dg, util];
  p.meta = {
    ...p.meta,
    organisation: "Entreprise Exemple",
    direction: "Qualité (transversal, tous services)",
    processus: "QUA Maîtriser et améliorer la qualité",
    pilote: "Responsable qualité",
    typeDocument: "procedure",
    titre: "Gestion des informations documentées", reference: "PR-QUA-01", version: "V0", niveau: 2,
    domaine: "support", dateApplication: "2026-09-25",
    signataires: {
      redige: { nom: "", fonction: "Pilote de processus", date: "2026-09-25" },
      verifie: { nom: "", fonction: "Responsable qualité", date: "" },
      approuve: { nom: "", fonction: "Direction", date: "" },
    },
    revisions: [nouvelleRevision({ id: "v1", version: "V0", date: "2026-09-25", nature: "Création initiale du document", auteur: "Responsable qualité" })],
    declencheur: "Besoin de créer, modifier ou retirer un document, exprimé auprès du pilote du processus",
    fin: "Document en vigueur ou archivé, registre EN-QUA-01 à jour (étapes 9 et 10)",
  };
  const e = (champs) => nouvelleEtape(champs);
  p.etapes = [
    e({ roleId: pilote.id, libelle: "Identifier le besoin documentaire", entree: "Besoin exprimé", entreeDe: "tout collaborateur", sortie: "Besoin qualifié" }),
    e({ roleId: pilote.id, libelle: "Rédiger le document", entree: "Besoin qualifié ou demande de correction (étapes 3, 5, 9)", sortie: "Projet V0 « brouillon, non applicable »", versQui: "Responsable qualité", outils: [{ id: "o1", type: "document", nom: "FO-QUA-01" }, { id: "o2", type: "document", nom: "IT-QUA-01" }] , risques: [nouveauRisque({ id: "k1", risque: "Document non approuvé utilisé", causes: "Projet circulant avant approbation", gravite: "3", probabilite: "2", mesure: "Mention « brouillon, non applicable » sur toute V0" })]}),
    e({ roleId: qualite.id, libelle: "Vérifier le document", entree: "Projet V0", entreeDe: "Pilote", sortie: "Document conforme, ou non conforme avec avis motivé (Pilote) ; délai 10 jours ouvrés", outils: [{ id: "o3", type: "document", nom: "IT-QUA-01" }] }),
    e({ roleId: qualite.id, libelle: "Codifier le document", entree: "Document conforme", sortie: "Document codifié, toujours en V0", versQui: "Direction", outils: [{ id: "o4", type: "document", nom: "EN-QUA-01" }] }),
    e({ roleId: dg.id, libelle: "Approuver le document", entree: "Document codifié", entreeDe: "Responsable qualité", sortie: "Document approuvé et signé, ou réserves", versQui: "Pilote", outils: [{ id: "o5", type: "document", nom: "Bloc « Validation du document »" }] }),
    e({ roleId: qualite.id, libelle: "Enregistrer le document", entree: "Document approuvé", sortie: "Document V1 enregistré, fichier maître en lecture seule", outils: [{ id: "o6", type: "document", nom: "EN-QUA-01" }] , risques: [nouveauRisque({ id: "k2", risque: "Perte ou altération d'un fichier maître", causes: "Panne, suppression, virus", gravite: "3", probabilite: "2", mesure: "Emplacement unique, lecture seule, sauvegarde et restauration testée" })]}),
    e({ roleId: qualite.id, libelle: "Diffuser le document", entree: "Document enregistré", sortie: "PDF diffusé, version précédente retirée", versQui: "Utilisateurs", outils: [{ id: "o7", type: "document", nom: "EN-QUA-02" }] , risques: [nouveauRisque({ id: "k3", risque: "Document non validé diffusé", causes: "Diffusion hors circuit, copies de travail", gravite: "3", probabilite: "3", mesure: "Contrôles des étapes 3 et 5 ; diffusion réservée au Responsable qualité" }), nouveauRisque({ id: "k4", risque: "Plusieurs versions en circulation", causes: "Retrait incomplet des anciennes versions", gravite: "4", probabilite: "2", mesure: "Retrait systématique, liste des copies papier, marquage « obsolète »" })]}),
    e({ roleId: util.id, libelle: "Appliquer le document", entree: "PDF diffusé, sensibilisation si besoin", sortie: "Retours d'application", versQui: "Pilote" }),
    e({ roleId: pilote.id, libelle: "Réviser le document", entree: "Retours, changement, incident, audit", sortie: "Décision tracée : maintien, modification (étape 2) ou retrait (étape 10)" , risques: [nouveauRisque({ id: "k5", risque: "Changement non suivi d'une revue", causes: "Changement non signalé au pilote", gravite: "3", probabilite: "2", mesure: "Le pilote apprécie l'incidence de tout changement et déclenche la revue" })]}),
    e({ roleId: qualite.id, libelle: "Retirer le document obsolète", entree: "Décision de retrait", sortie: "Document identifié « obsolète », archivé puis éliminé à l'échéance", outils: [{ id: "o8", type: "document", nom: "EN-QUA-01" }] , risques: [nouveauRisque({ id: "k6", risque: "Élimination prématurée d'une preuve", causes: "Durée de conservation mal connue", gravite: "4", probabilite: "1", mesure: "Élimination après vérification de l'échéance ; aucune élimination si la durée est inconnue" })]}),
  ];
  const [, s2, s3, , s5, , , , s9] = p.etapes;
  // Contrôles (triangle Q) : exemple de points de contrôle ; « Suite si non conforme » = retour à l'étape 2.
  s3.controle = { actif: true, nature: "Q", critere: "Conforme au modèle FO-QUA-01 et aux 11 points du contrôle avant diffusion (IT-QUA-01) ; exigences HSSE et réglementaires intégrées ; cohérent avec les autres documents", enregistrement: "Visa « Vérifié par »" };
  s3.condition = "Conforme";
  s3.sortie = "Document conforme ; délai 10 jours ouvrés";
  s3.alternatives = [nouvelleAlternative({ id: "a1", condition: "Non conforme", info: "Avis motivé", versQui: "Pilote de processus", vers: s2.id })];
  s5.controle = { actif: true, nature: "Q", critere: "Contenu validé par l'autorité d'approbation", enregistrement: "Visa « Approuvé par », registre EN-QUA-01" };
  s5.condition = "Approuvé";
  s5.sortie = "Document approuvé et signé";
  s5.versQui = "Responsable qualité";
  s5.alternatives = [nouvelleAlternative({ id: "a2", condition: "Réserves", info: "Réserves formulées", versQui: "Pilote de processus", vers: s2.id })];
  // Révision : trois suites possibles (retrait = suite normale, modification = retour à l'étape 2, maintien = fin).
  s9.condition = "Retrait";
  s9.sortie = "Décision de retrait tracée";
  s9.versQui = "Responsable qualité";
  s9.alternatives = [
    nouvelleAlternative({ id: "a3", condition: "Modification", info: "Décision de modification tracée", versQui: "Pilote de processus", vers: s2.id }),
    nouvelleAlternative({ id: "a4", condition: "Maintien", info: "Décision de maintien tracée", vers: "fin" }),
  ];
  p.corps = {
    objet: [
      {"id":"b1","type":"p","texte":"Définir comment l'organisation crée, vérifie, codifie, approuve, diffuse, révise, archive et élimine ses informations documentées, sur papier ou en numérique. La procédure garantit que seule la version en vigueur d'un document est utilisée et que les preuves exigées restent disponibles pendant leur durée de conservation."},
    ],
    domaine: [
      {"id":"b2","type":"p","texte":"Toutes les informations documentées internes de l'organisation, pour tous les services et tous les sites : fiches processus, procédures, instructions de travail, formulaires et enregistrements. Elle couvre aussi les documents d'origine externe (textes réglementaires, normes, exigences contractuelles) et les fichiers numériques du système documentaire. Exclusion : la mise en place d'un outil de gestion électronique des documents (GED). La procédure démarre quand un besoin de création, de modification ou de retrait est exprimé par tout collaborateur auprès du pilote du processus concerné (nouvelle activité, évolution réglementaire, changement organisationnel ou d'équipement, incident, non-conformité, audit, retour terrain)."},
    ],
    references: [
      {"id":"b3","type":"p","texte":"Exigences et documents de référence :"},
      {"id":"b4","type":"tableau","colonnes":["Type","Référence","Intitulé"],"lignes":[["Norme","ISO 9001:2026, § 7.5","Informations documentées"],["Norme","ISO 14001:2015 et ISO 45001:2018, § 7.5","Informations documentées"],["Norme","ISO 19011:2018","Lignes directrices pour l'audit des systèmes de management"],["Document interne","FO-QUA-01","Modèle standard de procédure"],["Document interne","IT-QUA-01","Guide de rédaction des procédures"],["Document interne","Cartographie","Cartographie des processus de l'organisation (codes processus)"]]},
    ],
    definitions: [
      {"id":"b5","type":"p","texte":"Termes et sigles utilisés :"},
      {"id":"b6","type":"tableau","colonnes":["Terme / Sigle","Définition"],"lignes":[["Information documentée","Information à maîtriser et à tenir à jour, avec son support (ISO 9001). Recouvre les documents et les enregistrements, papier ou numériques."],["Document maîtrisé","Document codifié, versionné, enregistré au registre EN-QUA-01 et diffusé de façon contrôlée."],["Enregistrement","Information documentée qui prouve qu'une activité a été réalisée (fiche remplie, registre, compte rendu)."],["Document obsolète","Document retiré de la diffusion, remplacé ou sans objet, conservé pour la traçabilité."],["Fichier maître","Version numérique de référence, conservée à l'emplacement officiel ; seule elle fait foi."],["Administrateur documentaire","Fonction qui tient le registre, codifie, enregistre, diffuse, archive et élimine. Assurée par le Responsable qualité."],["FP / PR / IT","Fiche processus (niveau 1) / Procédure (niveau 2 : qui fait quoi) / Instruction de travail (niveau 3 : comment faire)."],["FO / EN","Formulaire vierge / Enregistrement."],["SMI","Système de management intégré (qualité, santé et sécurité, environnement)."]]},
    ],
    responsabilites: [
      {"id":"b7","type":"p","texte":"Les rôles ci-dessous correspondent aux couloirs du logigramme (section 7)."},
      {"id":"b8","type":"genere"},
      {"id":"b9","type":"p","texte":"L'appui méthodologique du prestataire (cohérence avec le modèle standard) intervient avant la vérification ; il ne remplace ni l'approbation, ni la propriété des documents, qui restent à l'organisation."},
    ],
    description: [
      {"id":"b11","type":"genere"},
      {"id":"b12","type":"p","texte":"6.1 Codification et versions"},
      {"id":"b13","type":"p","texte":"Chaque document porte un code TYPE-PROCESSUS-NN : type FP (fiche processus), PR (procédure), IT (instruction de travail), FO (formulaire vierge) ou EN (enregistrement) ; code processus de la cartographie (PIL, QUA, COM, REA, LIV, RHU, ACH, MAI, FIN, SIN, JUR) ; numéro d'ordre à deux chiffres. Seul le Responsable qualité attribue un code, après vérification au registre EN-QUA-01. Un formulaire rempli est un enregistrement : il garde le code de son formulaire (FO)."},
      {"id":"b17","type":"p","texte":"V0 : projet non approuvé, marqué « brouillon, non applicable », quel que soit le nombre d'itérations. V1 : première version approuvée et diffusée, applicable dès sa date d'approbation. V2, V3… : révision, qui repasse par la vérification et l'approbation (étapes 2 à 7)."},
      {"id":"b18","type":"p","texte":"6.2 Documents numériques et externes"},
      {"id":"b19","type":"p","texte":"Les fichiers maîtres sont conservés à un emplacement officiel unique (lecteur partagé du serveur de l'organisation) ; le format modifiable n'est jamais diffusé. L'écriture est réservée au Responsable qualité et aux pilotes sur leur périmètre ; les versions approuvées sont en lecture seule. L'emplacement est sauvegardé périodiquement et la restauration testée (fréquence et responsable fixés par l'organisation)."},
      {"id":"b21","type":"p","texte":"Les textes réglementaires, normes et exigences contractuelles utilisés sont recensés dans la liste de veille EN-QUA-03, avec leur date de dernière vérification, en cohérence avec la veille du Juridique (JUR). Ils ne sont jamais modifiés ; toute évolution déclenche l'étape 9 pour les documents internes concernés."},
      {"id":"b22","type":"p","texte":"6.3 Copies papier et documents obsolètes"},
      {"id":"b23","type":"p","texte":"Les copies papier en service sont rangées dans les armoires des responsables concernés ; le Responsable qualité en tient la liste et les remplace à chaque nouvelle version : toute copie absente de cette liste est non maîtrisée. Une version remplacée est retirée de tous les points d'accès dès la diffusion de la nouvelle, marquée « obsolète » et archivée à part."},
    ],
    logigramme: [
      {"id":"b24","type":"p","texte":"Cycle de vie d'une information documentée (niveau 2). La légende des symboles figure dans le Guide de rédaction IT-QUA-01."},
    ],
    indicateurs: [
      {"id":"b27","type":"tableau","colonnes":["Indicateur","Mode de calcul","Cible","Fréquence"],"lignes":[["Taux de documents revus dans l'année","Documents revus (décision tracée) / documents en vigueur × 100 (EN-QUA-01)","Suivi en année 1","Annuelle"],["Délai moyen de mise à disposition","Moyenne (date de diffusion − date du projet V0), EN-QUA-01 et 02","≤ 30 jours calendaires","Semestrielle"]]},
      {"id":"b27g","type":"genere"},
    ],
    risques: [
      {"id":"b28","type":"p","texte":"Criticité = gravité × probabilité (1 à 4 chacune), selon le Guide de rédaction IT-QUA-01."},
      {"id":"b28g","type":"genere"},
      {"id":"b29","type":"tableau","colonnes":["Risque associé","Mesure de maîtrise","Acteur responsable"],"lignes":[["Perte de savoir au départ d'un pilote ou du Responsable qualité\nInstructions 1 à 10 · criticité 3 × 2 = 6","Suppléant désigné et formé pour chaque fonction","Direction"]]},
    ],
    enregistrements: [
      {"id":"b30","type":"tableau","colonnes":["Nom du document","Support","Durée de conservation","Lieu d'archivage"],"lignes":[["EN-QUA-01 — Registre des documents maîtrisés","Numérique (serveur), classeur en secours","Durée de vie du système documentaire","Lecteur partagé qualité"],["EN-QUA-02 — Registre de diffusion et preuves (émargements)","Numérique et papier","5 ans après remplacement du document","Lecteur partagé qualité"],["EN-QUA-03 — Liste de veille des documents externes","Numérique","Durée de vie du système documentaire","Lecteur partagé qualité"],["FO-XXX-NN — Formulaires remplis","Papier ou numérique","Exigence réglementaire ou contractuelle, 3 ans minimum","Armoires du service, serveur"],["Documents obsolètes","Papier ou numérique","Obligation légale ; si inconnue, aucune élimination","Salle des archives"]]},
    ],
    diffusion: [
      {"id":"b31","type":"p","texte":"Pour action : pilotes de processus, Responsable qualité, Direction. Pour information : ensemble du personnel. Diffusion en PDF sur le lecteur partagé, avec sensibilisation des pilotes ; le format modifiable reste au système documentaire."},
    ],
  };
  return p;
}
