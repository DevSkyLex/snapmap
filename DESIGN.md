# Design

Système visuel de **SnapMap** — app mobile Ionic, registre _product_, direction **iOS récent +
Instagram**, thème **adaptatif clair / sombre** (suit le réglage système).

## Theme

Épuré, natif, photo-forward. UI quasi **monochrome** (noir/blanc/gris + hairlines) ; la **photo
porte toute la couleur**. Le **dégradé Instagram** est strictement réservé aux moments de marque
(pastille du logo, icône d'état vide). Clair = blanc façon feed Instagram ; sombre = **noir pur**
(#000). Bascule automatique via `@media (prefers-color-scheme)`.

## Color palette

Tokens CSS exposés pour les deux thèmes (valeur sombre entre parenthèses).

| Rôle                      | Token          | Clair (Sombre)                                                   |
| ------------------------- | -------------- | ---------------------------------------------------------------- |
| Fond app                  | `--bg`         | `#FFFFFF` (`#000000`)                                            |
| Fond groupé / cellule     | `--bg-grouped` | `#FAFAFA` (`#0A0A0A`)                                            |
| Texte primaire            | `--ink`        | `#000000` (`#FFFFFF`)                                            |
| Texte secondaire          | `--secondary`  | `#6B6B6B` (`#A8A8A8`) — ≥4.5:1                                   |
| Texte tertiaire           | `--tertiary`   | `#8E8E8E`                                                        |
| Hairline                  | `--separator`  | `#DBDBDB` (`#262626`)                                            |
| Accent (liens, primaires) | `--accent`     | `#0095F6` (bleu Instagram)                                       |
| Like / danger             | `--like`       | `#ED4956` (rouge cœur Instagram)                                 |
| Dégradé Instagram         | `--ig-grad`    | `linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)` |

`--ig-grad` n'apparaît que sur la pastille de logo et l'icône d'état vide — jamais en texte
(`background-clip:text` banni), jamais comme remplissage d'UI courant.

## Typography

**Police système** (`-apple-system` → SF Pro sur iOS) — pas de webfont, rendu 100 % natif. Titres
de barre 17px/600, wordmark de marque 800 (tracking serré), secondaire en `--secondary`. Échelle
rem fixe (registre product). App forcée en **mode Ionic `ios`** sur toutes les plateformes.

## Components

- **Barres de nav** : compactes, translucides (`backdrop-filter` blur), hairline 0.5px. Galerie =
  wordmark Instagram à gauche + bouton caméra à droite ; autres = titre centré iOS.
- **Barre d'onglets** : translucide, hairline haute, icônes monochromes — **pleines à l'état actif,
  contour sinon** (signature Instagram). Galerie / Carte / Boutique.
- **Grille galerie** : **profil Instagram** — 3 colonnes carrées, gap 2px, bord-à-bord, sans
  radius. Photo aimée → petit cœur en incrustation.
- **Visualiseur photo** : plein écran **toujours sombre**, header/footer flottants ; barre
  d'actions façon Instagram (cœur + corbeille) + lieu/date. Like et suppression vivent ici.
- **Boutons** : primaire = **bleu Instagram** plein ; secondaire = surface neutre + hairline ;
  pression = `opacity .6` (iOS).
- **Boutique** : cartes nettes (hairline, rayon 14px), flou de verrouillage propre, prix +
  « Carte » (bleu) / « Google Pay » (neutre), badge déverrouillé.
- **États vides** : pastille dégradé Instagram + titre + sous-titre (+ CTA bleu sur la galerie).
- **Carte / Skeleton** : spinner iOS monochrome ; shimmer neutre.

## Layout

- Cellules galerie carrées 3 colonnes bord-à-bord ; cartes boutique 2 colonnes, gap 12px.
- Cibles tactiles ≥ 44px ; safe-area respectée (`viewport-fit=cover`).
- Rayons : 8/12/14px ; hairlines 0.5px ; z-index sémantique.

## Motion

120–250 ms, `ease-out`. Pression en `opacity`/`scale`, cœur qui « pop » au like, shimmer du
skeleton, spinner de carte. Désactivé en fondu/instantané sous `prefers-reduced-motion: reduce`.
