# Product

## Register

product

## Users

Jurés et utilisateurs d'un concours de développement mobile, et plus largement toute personne
qui capture des photos géolocalisées « sur le moment ». Contexte d'usage : sur mobile, en
déplacement, à une main, souvent en extérieur (lumière variable). L'utilisateur veut prendre une
photo, la voir apparaître sur une carte, la revivre, et éventuellement débloquer/revendre ses
clichés.

## Product Purpose

SnapMap est une app Ionic/Capacitor qui transforme des photos en souvenirs géolocalisés :
capture (caméra native), galerie avec likes et suppression, carte avec clustering des prises de
vue, et une mini-boutique de déblocage (Stripe). Le succès = une expérience fluide, lisible et
mémorable qui met **la photo au centre** sur les trois onglets (Galerie, Carte, Boutique).

## Brand Personality

Social, vibrant, énergique mais soigné — l'esprit d'une app de souvenirs entre Snapchat, BeReal
et Instagram, en plus net. Trois mots : **vif, tactile, premium**. L'interface doit donner envie
de capturer et de scroller ; chaque action (like, capture, déblocage) procure un petit shot de
satisfaction sans tomber dans le gadget.

## Anti-references

- Le look Ionic par défaut (barre bleue pleine, gris plats, composants génériques « starter »).
- Les dashboards SaaS froids (cartes grises identiques, bleu corporate).
- La surcharge : dégradés partout, néons criards, glassmorphism décoratif, ombres « ghost-card ».

## Design Principles

1. **La photo est l'héroïne** — l'UI est un écrin sombre qui fait ressortir les images, jamais
   un cadre qui leur vole la vedette.
2. **Vibrant mais discipliné** — une signature indigo→violet portée par les actions clés (FAB,
   primaires, onglet actif), surfaces sombres calmes autour.
3. **Le toucher répond** — chaque interaction a un retour visuel rapide (≤250 ms, ease-out) :
   pression, like qui « pop », capture qui pulse.
4. **Les états enseignent** — vides qui guident vers la première action, skeletons pendant le
   chargement, jamais un spinner perdu au milieu du contenu.
5. **Cohérence avant surprise** — même vocabulaire de boutons, rayons, ombres et typographie sur
   les trois onglets ; la fantaisie est réservée aux moments, pas aux pages.

## Accessibility & Inclusion

- Cible **WCAG 2.1 AA** : texte courant ≥ 4.5:1, gros texte/icônes ≥ 3:1 sur fond sombre.
- Cibles tactiles ≥ 44px, focus visibles, libellés explicites sur les boutons icône.
- `prefers-reduced-motion` respecté : toute animation a une alternative en fondu/instantané.
- Thème sombre forcé (choix produit) pensé pour la lisibilité en extérieur comme en intérieur.
