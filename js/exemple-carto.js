// exemple-carto.js — UN EXEMPLE de cartographie des processus, celle d'une organisation FICTIVE (« Entreprise Exemple ») : 11 processus
// répartis en trois blocs (management, réalisation, support), les échanges dessinés par les flèches, et les documents cités dans la
// procédure d'exemple PR-QUA-01. L'application est faite pour toute organisation : chacune charge la sienne (PDF, fichier .json ou saisie).
// Cet exemple ne sert qu'à essayer.

export function exempleCartographie() {
  const processus = [
    ["PIL", "Piloter l'organisation", "management"],
    ["QUA", "Maîtriser et améliorer la qualité", "management"],
    ["COM", "Développer et fidéliser la clientèle", "realisation"],
    ["REA", "Réaliser le produit ou le service", "realisation"],
    ["LIV", "Livrer et facturer", "realisation"],
    ["RHU", "Gérer les ressources humaines", "support"],
    ["ACH", "Acheter et gérer les stocks", "support"],
    ["MAI", "Maintenir les équipements", "support"],
    ["FIN", "Gérer les finances", "support"],
    ["SIN", "Gérer les systèmes d'information", "support"],
    ["JUR", "Garantir la conformité juridique", "support"],
  ].map(([code, nom, categorie]) => ({ id: "q-" + code.toLowerCase(), code, nom, categorie }));
  const flux = [
    ["contexte", "management", "Enjeux, risques et opportunités ⇄ orientations stratégiques", true],
    ["management", "realisation", "Orientations, objectifs, exigences", false],
    ["realisation", "management", "Données de performance, écarts, incidents", false],
    ["q-com", "q-rea", "Commandes et exigences du client", false],
    ["q-rea", "q-liv", "Produits ou services réalisés", false],
    ["q-liv", "satisfaction", "Produits livrés et facturés", false],
    ["q-com", "satisfaction", "Réponses aux demandes et aux réclamations", false],
    ["support", "realisation", "Personnel, équipements, achats, outils SI, conformité", false],
    ["realisation", "support", "Besoins en ressources", false],
  ].map(([de, vers, information, double], i) => ({ id: "f" + (i + 1), de, vers, information, double }));
  // Documents cités dans la procédure d'exemple PR-QUA-01 (registre EN-QUA-01 : le Responsable qualité attribue les codes).
  const documents = [
    ["PR-QUA-01", "Gestion des informations documentées"],
    ["FO-QUA-01", "Modèle standard de procédure"],
    ["IT-QUA-01", "Guide de rédaction des procédures"],
    ["EN-QUA-01", "Registre des documents maîtrisés"],
    ["EN-QUA-02", "Registre de diffusion et preuves (émargements)"],
    ["EN-QUA-03", "Liste de veille des documents externes"],
  ].map(([code, titre], i) => ({ id: "d" + (i + 1), code, titre }));
  return {
    organisation: "Entreprise Exemple",
    titre: "Cartographie des processus",
    contexte: "Enjeux internes et externes · parties intéressées et leurs exigences · réglementation · changements climatiques",
    exigences: "besoins et attentes des clients et des parties intéressées",
    satisfaction: "des exigences des clients et des parties intéressées",
    processus, flux, documents,
    nomenclature: { controle: true, procedure: "PR", instruction: "IT" }, // cette organisation code ses documents TYPE-PROCESSUS-NN (ex. PR-QUA-01) : c'est un réglage propre à elle
  };
}
