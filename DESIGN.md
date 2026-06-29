# Design

Système visuel de **SnapMap** — app mobile Ionic, registre _product_. Direction **« social teal »**
importée du design Claude (`SnapMap.dc.html`) : **galerie en grille comme accueil**, carte à pins
photo, boutique à cartes. Thème **adaptatif clair / sombre** (suit le réglage système). Repères :
Instagram, _Polarsteps_, applis photo iOS modernes.

## Theme

Photo-forward, **clair et frais**. Fond **gris froid** (`#E7E9EE`) d'où se détachent des **cartes
blanches** ; la photo porte la couleur, l'**accent teal** porte les actions (capture, onglet actif,
primaires, pins). Le **dégradé teal → cyan** est réservé aux moments de marque (logo, FAB, pastille
d'état vide). Clair = gris froid / surfaces blanches ; sombre = **bleu nuit** (`#0B0E14`). Bascule
automatique via `@media (prefers-color-scheme)`. App forcée en **mode Ionic `ios`**.

**Accessibilité du teal** : trois nuances pour rester ≥4.5:1. `--accent` (teal vif `#00C2A8` clair /
`#19D3B8` sombre) pour pins, onglet actif, icônes, dégradé. `--accent-strong` (`#00796B`) pour les
**fonds de boutons** à texte blanc (≥4.5:1) — un cran plus profond que le teal vif du mock, pour la
lisibilité. `--accent-text` (texte/liens accent : `#00796B` clair / `#19D3B8` sombre).

**Discipline du verre** : le `backdrop-filter` est réservé au **chrome** (tab bar, champ de recherche
carte) et aux **incrustations sur photo** (like, prix, badges, barre du visualiseur) — jamais en
décoration.

**Boutons plats** : pleins, **sans ombre** (préférence utilisateur conservée, même si le mock en
montre). L'ombre est réservée à l'**élévation** : cartes, FAB, barres, pins de carte. Les **cartes**
portent une ombre douce **sans bordure** (jamais bordure + ombre large ensemble).

## Color palette

Tokens CSS exposés pour les deux thèmes (valeur sombre entre parenthèses).

| Rôle                          | Token             | Clair (Sombre)                              |
| ----------------------------- | ----------------- | ------------------------------------------- |
| Fond app (gris froid)         | `--bg`            | `#E7E9EE` (`#0B0E14`)                        |
| Surface (cartes, barres)      | `--surface`       | `#FFFFFF` (`#151A23`)                        |
| Puce neutre / champ           | `--grouped`       | `#F1F3F6` (`#1B212C`)                        |
| Texte primaire                | `--ink`           | `#0E1726` (`#F2F4F8`)                        |
| Texte secondaire              | `--secondary`     | `#6B7686` (`#9AA3B0`) — ≥4.5:1               |
| Icônes / gros texte           | `--tertiary`      | `#8A93A2` (`#6B7686`)                        |
| Hairline                      | `--separator`     | `#E6E9EE` (`rgba(255,255,255,.08)`)          |
| Accent (pins, onglet actif)   | `--accent`        | `#00C2A8` (`#19D3B8`) — teal vif             |
| Accent fond bouton (AA)       | `--accent-strong` | `#00796B` — texte blanc ≥4.5:1              |
| Accent texte/liens            | `--accent-text`   | `#00796B` (`#19D3B8`)                        |
| Like / danger / 99+           | `--like`          | `#FF4D6D`                                    |
| Acheté (badge)                | `--success`       | `#00B09A` (`#19D3B8`)                        |
| Bouton secondaire foncé       | `--ink-btn`       | `#0E1726` (texte clair) — ex. Google Pay     |
| Dégradé de marque (teal→cyan) | `--accent-grad`   | `linear-gradient(145deg,#00C2A8,#00A2C4)`    |

## Typography

**Deux voix.** Display **Space Grotesk** (`--font-display`, 500–700) pour les titres d'écran (« Mes
photos », « Boutique »), les gros chiffres et les titres de feuille ; texte **Plus Jakarta Sans**
(`--font`, 400–800) pour tout le reste. Chargées via Google Fonts (`index.html`). Couple à fort
contraste (grotesque géométrique + humaniste), jamais deux sans-serifs jumelles. _(La précédente
signature « coordonnées GPS monospace » est abandonnée : ce design nomme le lieu + la date.)_

## Components

- **Galerie = accueil** : en-tête intégré (salutation + titre display) + **puces de filtre**
  (`Toutes · N` actif bleu nuit / `Aimées · N`), **grille 2 colonnes** de vignettes carrées (rayon
  20px) avec **cœur** (like) en bas-gauche, **FAB capture** teal flottant centré au-dessus de la tab
  bar, squelette _shimmer_ pendant la capture, état vide (pastille dégradé + CTA). Tap → visualiseur.
- **Carte** : Mapbox plein écran, **champ de recherche** flottant en haut (geocoding direct → `flyTo`),
  **bouton recentrer** en bas-droite, **pins photo ronds** bordés de blanc + pointe losange, **clusters**
  (pastille teal, `99+` rose), **point « ma position »** teal avec halo qui pulse. Petits clusters →
  spiderfy ; gros → feuille de lieu.
- **Boutique** : liste de **cartes** (rayon 24px, ombre douce) — _verrouillée_ : photo floutée +
  cadenas + « Photo verrouillée » + **lieu révélé** + prix, puis rangée **Acheter** (teal) / **Google
  Pay** (bleu nuit) ; _débloquée_ : photo nette + badge **Achetée** (teal) + légende lieu · HD.
- **Visualiseur photo** (modale plein écran) : **toujours sombre** ; carrousel `contain` (photo
  entière), barre haute (retour · compteur `i/N` · like · corbeille), bas : **épingle teal + lieu**
  (titre display) + date + badge « Achetée » + **pagination** (points, actif teal allongé).
- **Modale lieu (cluster)** : feuille draggable — en-tête **lieu teal + « N photos ici »** (display) +
  fermer neutre, **grille 3 colonnes** de vignettes.
- **Confirmation de suppression** : alerte iOS, action destructive **en rouge** (`alert-danger`).
- **Barre d'onglets** : pleine largeur, **verre dépoli**, hairline haute ; icônes pleines à l'actif en
  **teal**. Ordre : **Galerie · Carte · Boutique** (Galerie par défaut).

## Layout

- Écrans **sans barre de nav** : le titre vit dans le contenu (`.page-head`, respecte l'encoche).
- Galerie/cluster : grille (`grid-template-columns`) ; boutique : pile de cartes (flex colonne).
- Cibles tactiles ≥ 44px ; safe-area respectée (`viewport-fit=cover`).
- Tab bar + contrôles flottants (FAB, recherche, recentrer) en `position: fixed/absolute`.

## Motion

120–250 ms, `ease-out`. **Pins** : entrée _scale + fade_. **Point position** : halo qui pulse
(`sm-ping`). **Squelette** : _shimmer_. **Cœur** : _pop_ au like. **Pagination** : point actif qui
s'allonge. Tout désactivé sous `prefers-reduced-motion: reduce`.

## Écarts assumés vs `SnapMap.dc.html`

- **Boutons sans ombre** (le mock en montre) — préférence utilisateur + lisibilité.
- **Teal des boutons plus profond** (`#00796B`) que le teal vif du mock — contraste AA du texte blanc.
- **Visualiseur en `contain`** (photo entière) plutôt que `cover` — un visualiseur doit montrer toute
  la photo.
- **Pas d'avatar / pseudo** en galerie (pas de système de compte) — en-tête épuré.
- **Carte sans volet ni capture** (la capture vit dans le FAB galerie), conforme au mock.
- **Feuille Stripe** = feuille **native** Stripe (le mock l'illustre, on ne réimplémente pas un
  formulaire de carte — sécurité + natif). **Écran d'amorce de permission** non construit (le refus de
  localisation est déjà géré sans bloquer la carte).
