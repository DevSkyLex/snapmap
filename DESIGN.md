# Design

Système visuel de **SnapMap** — app mobile Ionic, registre _product_, direction **social &
vibrant** sur thème **sombre** avec accent **indigo électrique**.

## Theme

Sombre forcé (`dark` toujours actif, pas de bascule système). Fond quasi-noir teinté indigo qui
fait ressortir les photos ; une signature dégradé indigo→violet portée uniquement par les actions
clés. Vibrant mais discipliné : surfaces calmes, couleur réservée au sens (actions, état actif,
like).

## Color palette

OKLCH à la conception, exposé en CSS custom properties (tokens) + variables Ionic.

| Rôle                     | Token             | Valeur                                    |
| ------------------------ | ----------------- | ----------------------------------------- |
| Fond app                 | `--bg`            | `#0E0D14` (indigo-noir profond)           |
| Surface (cartes, barres) | `--surface`       | `#17151F`                                 |
| Surface élevée (modales) | `--surface-2`     | `#201D2B`                                 |
| Bordure                  | `--border`        | `rgba(255,255,255,.08)`                   |
| Texte primaire           | `--ink`           | `#F4F3FA`                                 |
| Texte secondaire         | `--muted`         | `#B0ABC4` (≥4.5:1 sur surface)            |
| Accent indigo            | `--accent`        | `#7C5CFC`                                 |
| Accent clair (hover)     | `--accent-bright` | `#9B83FF`                                 |
| Partenaire dégradé       | `--accent-2`      | `#B14EF0` (violet)                        |
| Dégradé signature        | `--grad`          | `linear-gradient(135deg,#6D5DFB,#B14EF0)` |
| Like / danger            | `--danger`        | `#FF4D6D` (rose vif)                      |
| Succès                   | `--success`       | `#2DD4A7`                                 |
| Warning                  | `--warning`       | `#FFB020`                                 |

Le dégradé signature ne s'applique qu'au FAB, aux boutons primaires, à l'indicateur d'onglet actif
et aux accents de marque — jamais en texte (`background-clip:text` banni).

## Typography

Une seule famille : **Plus Jakarta Sans** (Google Fonts, poids 400/500/600/700/800) — géométrique
humaniste, moderne et chaleureuse, adaptée au « social ». Échelle rem fixe (registre product),
ratio ~1.2. Wordmark « SnapMap » en 800, tracking serré (≥ -0.02em). Pas de pairing de polices.

## Components

- **Boutons** : primaire = dégradé signature, texte blanc, rayon 12px, pression `scale(.96)`.
  Secondaire = surface + bordure. Boutons icône = cercle frosté (`backdrop-filter`) sur les photos.
- **Cartes photo** : rayon 16px, ratio 1:1, `object-fit:cover`, voile dégradé bas pour la
  lisibilité des actions, pression `scale(.97)`. Pas d'ombre « ghost-card » (jamais bordure 1px +
  grosse ombre ensemble).
- **FAB capture** : 64px, dégradé signature, halo doux indigo, pression + pulse à la capture.
- **Barre d'onglets** : surface sombre, bordure haute subtile, onglet actif en indigo avec petit
  indicateur ; inactifs en `--muted`.
- **En-têtes** : toolbar transparente/sombre avec bordure basse fine (pas de barre bleue pleine) ;
  titre de marque à gauche, gros et net.
- **États vides** : icône en pastille dégradée + titre + sous-titre + indice vers le FAB.
- **Skeleton** : shimmer (dégradé qui balaie), pas de spinner dans le contenu.
- **Like** : cœur qui « pop » (scale + teinte rose) au tap.

## Layout

- Grille photo : 2 colonnes, gap 10px, padding latéral 12px (mobile-first, une main).
- Cibles tactiles ≥ 44px ; safe-area respectée (`viewport-fit=cover`).
- Échelle de rayons : 10/12/16px (cartes ≤16px), pills pour tags/compteurs.
- Z-index sémantique : contenu < sticky < backdrop < modal < toast.

## Motion

150–250 ms, `ease-out` (quart/expo). Pression sur tout élément tactile, like qui pop, FAB pulse à
la capture, shimmer du skeleton, fondu d'entrée des cartes (léger, échelonné). Tout est désactivé
en fondu/instantané sous `prefers-reduced-motion: reduce`.
