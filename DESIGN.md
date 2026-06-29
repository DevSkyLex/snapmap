# Design

Système visuel de **SnapMap** — app mobile Ionic, registre _product_, direction **feed Instagram +
iOS récent**, thème **adaptatif clair / sombre** (suit le réglage système). Référence : la vidéo de
démo fournie par l'utilisateur (feed sombre, accent bleu, tab bar flottante).

## Theme

Épuré, natif, photo-forward. UI quasi **monochrome** (noir/blanc/gris + hairlines) ; la **photo
porte toute la couleur**. Le **dégradé Instagram** est réservé à un seul moment de marque (icône
d'état vide). Clair = blanc façon feed Instagram ; sombre = **noir pur** (#000). Bascule automatique
via `@media (prefers-color-scheme)`. App forcée en **mode Ionic `ios`** sur toutes les plateformes.

## Color palette

Tokens CSS exposés pour les deux thèmes (valeur sombre entre parenthèses).

| Rôle                        | Token          | Clair (Sombre)                                                   |
| --------------------------- | -------------- | ---------------------------------------------------------------- |
| Fond app                    | `--bg`         | `#FFFFFF` (`#000000`)                                            |
| Fond groupé / cellule       | `--bg-grouped` | `#FAFAFA` (`#0A0A0A`)                                            |
| Texte primaire              | `--ink`        | `#000000` (`#FFFFFF`)                                            |
| Texte secondaire            | `--secondary`  | `#6B6B6B` (`#A8A8A8`) — ≥4.5:1                                   |
| Hairline                    | `--separator`  | `#DBDBDB` (`#262626`)                                            |
| Accent (Snap, onglet actif) | `--accent`     | `#0A84FF` (bleu iOS)                                             |
| Like / danger               | `--like`       | `#ED4956`                                                        |
| Acheté (badge)              | `--success`    | `#30D158` (vert iOS)                                             |
| Dégradé marque (état vide)  | `--ig-grad`    | `linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)` |

## Typography

**Police système** (`-apple-system` → SF Pro sur iOS) — pas de webfont, rendu natif. Titre de barre
centré 17px/600, lieu de carte 600, date/secondaire en `--secondary`. Échelle rem fixe.

## Components

- **Galerie = feed plein écran** (façon TikTok/Snapchat) : **un élément = toute la hauteur**
  (`100dvh`), défilement par à-coups (`scroll-snap-type: y mandatory`). Photo nette `contain` sur un
  **fond flouté** qui remplit l'écran ; en haut avatar + **lieu** (reverse geocoding) + date + badge
  vert **« Acheté »** ; **cœur** (like) en bas à droite. Scrims dégradés pour la lisibilité.
- **Bouton « Snap »** : pilule **bleue flottante** (caméra) centrée au-dessus de la tab bar — la
  capture vit là.
- **Barre d'onglets** : **flottante arrondie** translucide (style iOS 26), icônes monochromes
  **pleines à l'actif** en **bleu** / contour sinon. Galerie / Carte / Boutique.
- **Barre de nav** : translucide, titre **« SnapMap » centré**, hairline 0.5px.
- **Visualiseur photo** : plein écran **toujours sombre** ; sous la photo, **lieu** + badge vert
  « Achetée » + date, et la rangée d'actions **« J'aime » (cœur) + corbeille** (like et suppression
  vivent ici).
- **Boutique** : cartes nettes (hairline, rayon 14px), flou de verrouillage, prix + « Carte »
  (bleu) / « Google Pay » (neutre) ; l'achat ouvre la **feuille Stripe native**.
- **États vides** : pastille dégradé + titre + sous-titre + CTA bleu.

## Layout

- Feed une colonne, gap 22px, padding latéral 14px ; photo de carte 4:5.
- Cibles tactiles ≥ 44px ; safe-area respectée (`viewport-fit=cover`).
- Tab bar flottante + bouton Snap en `position: fixed` au-dessus.

## Motion

120–250 ms, `ease-out`. Pression en `scale`/`opacity`, cœur qui « pop » au like, shimmer du
skeleton, spinner de carte. Désactivé sous `prefers-reduced-motion: reduce`.
