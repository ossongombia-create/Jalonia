// carto-schemas.js — v1.5 : les SEPT FAMILLES DE SCHÉMAS de la cartographie autres que les bandes (dessinées par carto-dessin.js).
// Demande de Brice : 50 modèles de cartographie aux schémas réellement différents. Le contenu (processus, flux, fiches) ne change pas :
// seule la forme change. Chaque famille a deux sens (« normal » / « alterne ») et s'adapte au nombre de processus (0 à MAX_PROCESSUS).
//
//   chaine     chaîne de valeur : la réalisation en chevrons, le management au-dessus, le support en dessous
//   maison     toit (management), piliers (réalisation), fondations (support)
//   roue       les processus en anneau autour du client ; « alterne » : réalisation sur l'anneau intérieur
//   colonnes   une colonne par bloc ; « alterne » : la réalisation en premier, plus large
//   client     du besoin du client à sa satisfaction ; « alterne » : à la verticale, de haut en bas
//   serpentin  la réalisation serpente (3 cartes par rang ; « alterne » : 4)
//   etoile     le pilotage au centre, la réalisation en étoile ; « alterne » : le support aussi sur l'étoile
//
//   svgSchema(c)   -> une chaîne SVG complète (même cadre que les bandes : en-tête, Contexte, encadrés Exigences / Satisfaction)
//   planSchema(c)  -> résumé { schema, sens, W, H, cartes:[{ code, x, y, w, h }] } (pour les tests)
//
// Aucune dépendance au navigateur. Le texte saisi est toujours échappé (escapeXML). Les dimensions du SVG (width / height) sont
// conservées : l'export PNG et le Word les lisent. Pas de foreignObject (il empêcherait l'export en image).

import { t } from "./i18n.js";
import { W, COULEURS, INK, MUTED, TITRE, TRAIT, FONT, escapeXML, couper, enteteSvg } from "./carto-dessin.js";

const X0 = 175, X1 = 1435, BW = X1 - X0, Y0 = 186;   // même aire de dessin que les bandes
const CH = 64, GAP = 16;                              // hauteur d'une carte de processus, espace entre cartes
const BLOCS = ["management", "realisation", "support", "verification", ""];

// Répartit les processus par bloc (les processus sans bloc sont dessinés avec le support, en gris).
function grouper(c) {
  const g = { management: [], realisation: [], support: [], verification: [], "": [] };
  (c.processus || []).forEach((p) => g[BLOCS.includes(p.categorie) ? p.categorie : ""].push(p));
  return g;
}

// ---------- Primitives de dessin (communes aux familles) ----------
function nouveauDessin() {
  const o = [];
  const cartes = [];
  const R = (x, y, w, h, r, fill, stroke = "none", sw = 0, extra = "") =>
    o.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`);
  const T = (x, y, s, sz, fill, w = "400", a = "start", it = false) =>
    o.push(`<text x="${x}" y="${y}" font-family="${FONT}" font-size="${sz}" font-weight="${w}" fill="${fill}" text-anchor="${a}"${it ? ' font-style="italic"' : ""}>${escapeXML(s)}</text>`);
  const L = (x1, y1, x2, y2, col, sw = 3, dbl = false, pointe = true) =>
    o.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${sw}"${pointe ? ' marker-end="url(#ae)"' : ""}${dbl ? ' marker-start="url(#as)"' : ""}/>`);
  const couleurDe = (p) => COULEURS[p.categorie] || COULEURS[""];
  // Carte de processus « large » : pastille de couleur, code, nom sur deux lignes.
  const carte = (x, y, w, h, p) => {
    const col = couleurDe(p);
    cartes.push({ code: p.code, x, y, w, h });
    R(x, y, w, h, 14, "#ffffff", TRAIT, 1.1, 'filter="url(#sh)"');
    const br = 16, bx = x + 14 + br, by = y + h / 2;
    o.push(`<circle cx="${bx}" cy="${by}" r="${br}" fill="${col}"/>`);
    o.push(`<rect x="${bx - br * 0.4}" y="${by - br * 0.4}" width="${br * 0.8}" height="${br * 0.8}" rx="${br * 0.22}" fill="#fff" opacity="0.92"/>`);
    const tx = bx + br + 10;
    const lignes = couper(p.nom, Math.max(6, Math.floor((x + w - tx - 8) / 7.4)), 2);
    const base = by - (lignes.length * 17) / 2 + 6;
    T(tx, base, p.code, 16, col, "800");
    lignes.forEach((l, i) => T(tx, base + (i + 1) * 17, l, 13, INK, "400"));
  };
  // Carte « haute » (piliers, colonnes étroites) : code en haut, nom centré sur plusieurs lignes.
  const carteHaute = (x, y, w, h, p) => {
    const col = couleurDe(p);
    cartes.push({ code: p.code, x, y, w, h });
    R(x, y, w, h, 14, "#ffffff", TRAIT, 1.1, 'filter="url(#sh)"');
    R(x, y, w, 10, 5, col);
    T(x + w / 2, y + 42, p.code, 18, col, "800", "middle");
    const maxL = Math.max(1, Math.floor((h - 64) / 17));
    couper(p.nom, Math.max(5, Math.floor((w - 16) / 7.2)), maxL).forEach((l, i) => T(x + w / 2, y + 66 + i * 17, l, 13, INK, "400", "middle"));
  };
  // Bloc coloré avec son libellé au-dessus.
  const bloc = (x, y, w, h, categorie, libelle = true) => {
    const col = COULEURS[categorie] || COULEURS[""];
    R(x, y, w, h, 18, col + "14");
    if (libelle) T(x + 2, y - 8, t("carto.categorie." + (categorie || "aucune")).toUpperCase(), 13, col, "800");
  };
  // Une rangée (éventuellement sur plusieurs lignes) de cartes larges, centrée dans [x, x + w]. Rend la hauteur occupée.
  const rangee = (liste, x, y, w, parRang, h = CH) => {
    const n = liste.length;
    if (!n) return 0;
    const cols = Math.max(1, Math.min(parRang, n));
    const cw = (w - (cols - 1) * GAP) / cols;
    liste.forEach((p, i) => {
      const lig = Math.floor(i / cols), col = i % cols;
      const surCeRang = Math.min(cols, n - lig * cols);
      const depart = x + (w - (surCeRang * cw + (surCeRang - 1) * GAP)) / 2;
      carte(depart + col * (cw + GAP), y + lig * (h + 14), cw, h, p);
    });
    const lignes = Math.ceil(n / cols);
    return lignes * h + (lignes - 1) * 14;
  };
  return { o, cartes, R, T, L, carte, carteHaute, bloc, rangee, couleurDe };
}

// Un bloc entier : fond et libellé (dessinés d'abord), puis la rangée de cartes. Rend la hauteur du bloc (0 s'il est vide).
function blocComplet(d, liste, categorie, y, parRang = 4) {
  if (!liste.length) return 0;
  const lignes = Math.ceil(liste.length / Math.max(1, Math.min(parRang, liste.length)));
  const h = lignes * CH + (lignes - 1) * 14 + 32;
  d.bloc(X0, y, BW, h, categorie);
  d.rangee(liste, X0 + 20, y + 16, BW - 40, parRang);
  return h;
}

// Encadrés latéraux Exigences (gauche) et Satisfaction (droite), sur toute la hauteur du dessin, reliés au corps.
function encadres(d, haut, bas) {
  const h = Math.max(120, bas - haut), mid = haut + h / 2;
  const pod = (x, fill, titre, sous, col) => {
    d.R(x, haut, 110, h, 24, fill);
    d.o.push(`<circle cx="${x + 55}" cy="${haut + 46}" r="30" fill="#ffffff"/>`);
    const lignes = couper(sous, 14, 5);
    const top = mid - (22 + lignes.length * 16) / 2;
    d.T(x + 55, top + 16, titre, titre.length > 10 ? 13 : 16, "#fff", "800", "middle");
    lignes.forEach((l, i) => d.T(x + 55, top + 36 + i * 16, l, 11, col, "400", "middle"));
  };
  pod(40, TITRE, "EXIGENCES", d._exigences, "#eaf2fb");
  pod(1450, "#6f5091", "SATISFACTION", d._satisfaction, "#fdeed3");
  d.L(150, mid, X0 - 4, mid, TITRE, 3, true);
  d.L(X1 + 4, mid, 1450, mid, "#6f5091", 3, true);
}

// ---------- Les familles ----------
// Chaque famille dessine son corps à partir de Y0 et rend { haut, bas, encadres } (encadres : dessiner Exigences / Satisfaction).
const FAMILLES = {
  // Chaîne de valeur : la réalisation en chevrons de gauche à droite.
  chaine(d, g, alterne) {
    let y = Y0;
    const hm = blocComplet(d, g.management, "management", y);
    if (hm) { y += hm + 26; }
    const r = g.realisation, n = r.length;
    if (n) {
      const parRang = alterne ? Math.max(1, Math.ceil(n / 2)) : Math.min(n, 5);
      const rangs = Math.ceil(n / parRang), h = 116;
      d.T(X0 + 2, y + 6, t("carto.categorie.realisation").toUpperCase(), 13, COULEURS.realisation, "800");
      y += 16;
      for (let k = 0; k < rangs; k += 1) {
        const ligne = r.slice(k * parRang, (k + 1) * parRang);
        const w = BW / parRang, top = y + k * (h + 18);
        ligne.forEach((p, i) => {
          const x = X0 + i * w, pointe = 30, creux = i === 0 ? 0 : pointe;
          d.o.push(`<polygon points="${x},${top} ${x + w - pointe},${top} ${x + w},${top + h / 2} ${x + w - pointe},${top + h} ${x},${top + h} ${x + creux},${top + h / 2}" fill="${COULEURS.realisation}" stroke="#ffffff" stroke-width="3"/>`);
          d.cartes.push({ code: p.code, x, y: top, w, h });
          const tx = x + creux + 14;
          d.T(tx, top + 40, p.code, 18, "#ffffff", "800");
          couper(p.nom, Math.max(6, Math.floor((w - creux - pointe - 24) / 7.4)), 3).forEach((l, j) => d.T(tx, top + 62 + j * 17, l, 13, "#ffffff", "400"));
        });
      }
      y += rangs * (h + 18) + 12;
    }
    const hs = blocComplet(d, [...g.support, ...g[""]], "support", y);
    if (hs) y += hs + 26;
    const hv = blocComplet(d, g.verification, "verification", y);
    if (hv) y += hv + 26;
    return { haut: Y0, bas: Math.max(Y0 + 90, y - 26), encadres: true };
  },

  // Maison : toit (management), piliers (réalisation), chaînage (surveillance), fondations (support).
  maison(d, g, alterne) {
    let y = Y0;
    const m = g.management, rangsM = m.length ? Math.ceil(m.length / 3) : 1;
    const toitH = 70 + rangsM * (CH + 14);
    if (alterne) {
      d.R(X0, y, BW, toitH - 10, 18, COULEURS.management + "1c", COULEURS.management, 2);
      d.T(X0 + 20, y + 30, t("carto.categorie.management").toUpperCase(), 13, COULEURS.management, "800");
      d.rangee(m, X0 + 30, y + 46, BW - 60, 4);
    } else {
      d.o.push(`<polygon points="${X0},${y + toitH} 800,${y} ${X1},${y + toitH}" fill="${COULEURS.management}1c" stroke="${COULEURS.management}" stroke-width="2.5" stroke-linejoin="round"/>`);
      d.T(800, y + 44, t("carto.categorie.management").toUpperCase(), 13, COULEURS.management, "800", "middle");
      d.rangee(m, X0 + 230, y + toitH - rangsM * (CH + 14) - 4, BW - 460, 3);
    }
    y += toitH + 22;
    const r = g.realisation, n = r.length;
    if (n) {
      const parRang = Math.min(n, alterne ? 5 : 6), rangs = Math.ceil(n / parRang), ph = 150;
      d.T(X0 + 2, y - 4, t("carto.categorie.realisation").toUpperCase(), 13, COULEURS.realisation, "800");
      for (let k = 0; k < rangs; k += 1) {
        const ligne = r.slice(k * parRang, (k + 1) * parRang);
        const pw = (BW - 40 - (parRang - 1) * 22) / parRang;
        ligne.forEach((p, i) => d.carteHaute(X0 + 20 + i * (pw + 22), y + 8 + k * (ph + 16), pw, ph, p));
      }
      y += rangs * (ph + 16) + 30;
    }
    const hv = blocComplet(d, g.verification, "verification", y);
    if (hv) y += hv + 26;
    const s = [...g.support, ...g[""]];
    if (s.length) {
      const lignes = Math.ceil(s.length / Math.min(4, s.length)), h = lignes * CH + (lignes - 1) * 14 + 40;
      d.R(X0, y, BW, h, 10, COULEURS.support + "26", COULEURS.support, 2);
      d.T(X0 + 2, y - 8, t("carto.categorie.support").toUpperCase(), 13, COULEURS.support, "800");
      d.rangee(s, X0 + 10, y + 20, BW - 20, 4);
      y += h + 26;
    }
    return { haut: Y0, bas: Math.max(Y0 + 90, y - 26), encadres: true };
  },

  // Roue : les processus en anneau autour du client (au centre). « alterne » : la réalisation sur l'anneau intérieur.
  roue(d, g) {
    const tous = [...g.realisation, ...g.support, ...g[""], ...g.verification, ...g.management];
    const sens = d._alterne;
    const anneaux = sens
      ? [g.realisation, [...g.support, ...g[""], ...g.verification, ...g.management]]
      : tous.length > 14 ? [tous.slice(0, Math.ceil(tous.length * 0.4)), tous.slice(Math.ceil(tous.length * 0.4))] : [[], tous];
    const nMax = Math.max(anneaux[0].length, anneaux[1].length);
    const cw = nMax > 12 ? 180 : 230, ch = nMax > 12 ? 56 : 60;
    const ext = { rx: 590, ry: tous.length > 10 ? 340 : 280 }, int = { rx: 320, ry: 175 };
    const cx = 800, cy = Y0 + ext.ry + ch / 2 + 10;
    if (anneaux[1].length) d.o.push(`<ellipse cx="${cx}" cy="${cy}" rx="${ext.rx}" ry="${ext.ry}" fill="none" stroke="${TRAIT}" stroke-width="3" stroke-dasharray="10 8"/>`);
    if (anneaux[0].length) d.o.push(`<ellipse cx="${cx}" cy="${cy}" rx="${int.rx}" ry="${int.ry}" fill="none" stroke="${COULEURS.realisation}" stroke-opacity="0.45" stroke-width="3" stroke-dasharray="10 8"/>`);
    const rc = anneaux[0].length ? 105 : 130;
    d.o.push(`<circle cx="${cx}" cy="${cy}" r="${rc}" fill="#eef4f5" stroke="${TITRE}" stroke-width="3"/>`);
    d.T(cx, cy - 6, t("carto.dessin.client"), 24, TITRE, "800", "middle");
    d.T(cx, cy + 20, t("carto.dessin.exigences_satisfaction"), 13, MUTED, "400", "middle", true);
    const place = (liste, a) => liste.forEach((p, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / liste.length;
      d.carte(cx + a.rx * Math.cos(ang) - cw / 2, cy + a.ry * Math.sin(ang) - ch / 2, cw, ch, p);
    });
    place(anneaux[0], int);
    place(anneaux[1], ext);
    return { haut: Y0, bas: cy + ext.ry + ch / 2, encadres: false };
  },

  // Colonnes : une colonne par bloc, cartes empilées. « alterne » : la réalisation en premier, plus large.
  colonnes(d, g, alterne) {
    let cols = ["management", "realisation", "support", "verification", ""].filter((k) => g[k].length);
    if (alterne) cols = ["realisation", ...cols.filter((k) => k !== "realisation")];
    cols = cols.filter((k) => g[k].length);
    if (!cols.length) return { haut: Y0, bas: Y0 + 90, encadres: true };
    const poids = cols.map((k) => (k === "realisation" ? (alterne ? 1.7 : 1.4) : 1));
    const unite = (BW - (cols.length - 1) * 20) / poids.reduce((a, b) => a + b, 0);
    const hauteur = Math.max(...cols.map((k) => g[k].length)) * (CH + 12) - 12 + 32;
    let x = X0;
    cols.forEach((k, i) => {
      const w = unite * poids[i];
      d.bloc(x, Y0, w, hauteur, k);
      g[k].forEach((p, j) => d.carte(x + 12, Y0 + 16 + j * (CH + 12), w - 24, CH, p));
      x += w + 20;
    });
    return { haut: Y0, bas: Y0 + hauteur, encadres: true };
  },

  // Client à client : du besoin à la satisfaction. Normal : la réalisation dans une grande flèche horizontale ; « alterne » : à la verticale.
  client(d, g, alterne) {
    let y = Y0;
    const r = g.realisation, s = [...g.support, ...g[""]];
    if (!alterne) {
      const hm = blocComplet(d, g.management, "management", y);
      if (hm) y += hm + 26;
      if (r.length) {
        const parRang = Math.min(r.length, 5), rangs = Math.ceil(r.length / parRang);
        const h = rangs * CH + (rangs - 1) * 14 + 44;
        d.o.push(`<polygon points="${X0},${y} ${X1 - 70},${y} ${X1},${y + h / 2} ${X1 - 70},${y + h} ${X0},${y + h}" fill="${COULEURS.realisation}1f" stroke="${COULEURS.realisation}" stroke-width="2.5" stroke-linejoin="round"/>`);
        d.T(X0 + 2, y - 8, t("carto.categorie.realisation").toUpperCase(), 13, COULEURS.realisation, "800");
        const avant = d.cartes.length;
        d.rangee(r, X0 + 20, y + 22, BW - 120, parRang);
        const cs = d.cartes.slice(avant);
        for (let i = 0; i < cs.length - 1; i += 1) {
          if (Math.abs(cs[i].y - cs[i + 1].y) < 2) d.L(cs[i].x + cs[i].w + 2, cs[i].y + CH / 2, cs[i + 1].x - 2, cs[i + 1].y + CH / 2, COULEURS.realisation, 2.5);
        }
        y += h + 26;
      }
      const hs = blocComplet(d, s, "support", y);
      if (hs) y += hs + 26;
      const hv = blocComplet(d, g.verification, "verification", y);
      if (hv) y += hv + 26;
      return { haut: Y0, bas: Math.max(Y0 + 90, y - 26), encadres: true };
    }
    // Vertical : Exigences en haut, réalisation au centre de haut en bas, Satisfaction en bas.
    d.R(X0, y, BW, 54, 27, TITRE);
    d.T(800, y + 34, t("carto.dessin.exigences"), 17, "#ffffff", "800", "middle");
    y += 54 + 34;
    const top = y, colW = 330, cw = 520;
    const pile = (liste, x, w, k) => {
      if (!liste.length) return 0;
      const h = liste.length * (CH + 12) - 12 + 32;
      d.bloc(x, top, w, h, k);
      liste.forEach((p, j) => d.carte(x + 12, top + 16 + j * (CH + 12), w - 24, CH, p));
      return h;
    };
    const hm = pile(g.management, X0, colW, "management");
    const xr = X0 + colW + 40;
    r.forEach((p, j) => {
      const yy = top + j * (CH + 30);
      d.carte(xr, yy, cw, CH, p);
      if (j < r.length - 1) d.L(xr + cw / 2, yy + CH + 2, xr + cw / 2, yy + CH + 28, COULEURS.realisation, 2.5);
    });
    if (r.length) d.T(xr, top - 8, t("carto.categorie.realisation").toUpperCase(), 13, COULEURS.realisation, "800");
    const hr = r.length ? r.length * (CH + 30) - 30 : 0;
    const xs = X1 - colW;
    const hs = pile(s, xs, colW, "support");
    let hv = 0;
    if (g.verification.length) {
      const yv = top + hs + (hs ? 40 : 0);
      hv = g.verification.length * (CH + 12) - 12 + 32;
      d.bloc(xs, yv, colW, hv, "verification");
      g.verification.forEach((p, j) => d.carte(xs + 12, yv + 16 + j * (CH + 12), colW - 24, CH, p));
      hv += hs ? 40 : 0;
    }
    y = top + Math.max(hm, hr, hs + hv, 64) + 34;
    d.L(800, top - 30, 800, top - 4, TITRE, 3);
    d.R(X0, y, BW, 54, 27, "#6f5091");
    d.T(800, y + 34, t("carto.dessin.satisfaction"), 17, "#ffffff", "800", "middle");
    return { haut: Y0, bas: y + 54, encadres: false };
  },

  // Serpentin : la réalisation serpente d'un rang à l'autre (3 cartes par rang ; « alterne » : 4).
  serpentin(d, g, alterne) {
    let y = Y0;
    const hm = blocComplet(d, g.management, "management", y);
    if (hm) y += hm + 26;
    const r = g.realisation, n = r.length;
    if (n) {
      const parRang = alterne ? 4 : 3, rangs = Math.ceil(n / parRang), pas = 64;
      const cw = (BW - 40 - (parRang - 1) * pas) / parRang;
      const h = rangs * CH + (rangs - 1) * 44 + 40;
      d.bloc(X0, y, BW, h, "realisation");
      const pos = [];
      r.forEach((p, i) => {
        const k = Math.floor(i / parRang), c = k % 2 ? parRang - 1 - (i % parRang) : i % parRang;
        const x = X0 + 20 + c * (cw + pas), yy = y + 20 + k * (CH + 44);
        d.carte(x, yy, cw, CH, p);
        pos.push({ x, y: yy });
      });
      for (let i = 0; i < pos.length - 1; i += 1) {
        const a = pos[i], b = pos[i + 1];
        if (Math.abs(a.y - b.y) < 2) {
          if (b.x > a.x) d.L(a.x + cw + 4, a.y + CH / 2, b.x - 4, b.y + CH / 2, COULEURS.realisation, 2.5);
          else d.L(a.x - 4, a.y + CH / 2, b.x + cw + 4, b.y + CH / 2, COULEURS.realisation, 2.5);
        } else d.L(a.x + cw / 2, a.y + CH + 4, b.x + cw / 2, b.y - 4, COULEURS.realisation, 2.5);
      }
      y += h + 26;
    }
    const hs = blocComplet(d, [...g.support, ...g[""]], "support", y);
    if (hs) y += hs + 26;
    const hv = blocComplet(d, g.verification, "verification", y);
    if (hv) y += hv + 26;
    return { haut: Y0, bas: Math.max(Y0 + 90, y - 26), encadres: true };
  },

  // Étoile : le pilotage (management) au centre, la réalisation en étoile autour. « alterne » : le support et la surveillance aussi.
  etoile(d, g, alterne) {
    const s = [...g.support, ...g[""]];
    const branches = alterne ? [...g.realisation, ...s, ...g.verification] : g.realisation;
    const m = g.management, hubH = Math.max(1, m.length) * (CH + 10) + 50, hubW = 340;
    const n = branches.length, cw = n > 12 ? 180 : 220;
    const rx = 500, ry = Math.max(230, hubH / 2 + 130);
    const cx = 800, cy = Y0 + ry + CH / 2 + 10;
    branches.forEach((p, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, n);
      const px = cx + rx * Math.cos(a), py = cy + ry * Math.sin(a);
      d.L(cx, cy, px, py, d.couleurDe(p), 2.5, false, false);
    });
    d.R(cx - hubW / 2, cy - hubH / 2, hubW, hubH, 20, "#ffffff", COULEURS.management, 3);
    d.T(cx, cy - hubH / 2 + 30, t("carto.categorie.management").toUpperCase(), 13, COULEURS.management, "800", "middle");
    m.forEach((p, j) => d.carte(cx - hubW / 2 + 14, cy - hubH / 2 + 42 + j * (CH + 10), hubW - 28, CH, p));
    branches.forEach((p, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, n);
      d.carte(cx + rx * Math.cos(a) - cw / 2, cy + ry * Math.sin(a) - CH / 2, cw, CH, p);
    });
    let y = cy + ry + CH / 2 + 40;
    if (!alterne) {
      const hs = blocComplet(d, s, "support", y);
      if (hs) y += hs + 26;
      const hv = blocComplet(d, g.verification, "verification", y);
      if (hv) y += hv + 26;
      y -= 26;
    } else y -= 40;
    return { haut: Y0, bas: Math.max(cy + ry + CH / 2, y), encadres: true };
  },
};

function construire(c) {
  const carto = c || {};
  const schema = FAMILLES[carto.schema] ? carto.schema : "chaine";
  const alterne = carto.sens === "alterne";
  const d = nouveauDessin();
  d._alterne = alterne;
  d._exigences = carto.exigences || "Besoins et attentes des parties intéressées";
  d._satisfaction = carto.satisfaction || "Exigences des clients et des parties intéressées";
  const r = FAMILLES[schema](d, grouper(carto), alterne);
  if (r.encadres) encadres(d, r.haut, r.bas);
  const H = Math.ceil(r.bas + 40);
  return { carto, schema, sens: alterne ? "alterne" : "normal", d, H };
}

export function planSchema(c) {
  const { schema, sens, d, H } = construire(c);
  return { schema, sens, W, H, cartes: d.cartes.map((k) => ({ ...k })) };
}

export function svgSchema(c) {
  const { carto, d, H } = construire(c);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    '<defs>'
      + '<marker id="ae" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0L9 4.5L0 9z" fill="context-stroke"/></marker>'
      + '<marker id="as" markerWidth="9" markerHeight="9" refX="2" refY="4.5" orient="auto"><path d="M9 0L0 4.5L9 9z" fill="context-stroke"/></marker>'
      + '<filter id="sh" x="-6%" y="-6%" width="112%" height="124%"><feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#5b4a78" flood-opacity="0.18"/></filter></defs>',
    `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`,
    ...enteteSvg(carto, W),
    ...d.o,
    "</svg>",
  ].join("\n");
}
