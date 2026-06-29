# Architecture — SnapMap

Architecture reprise du projet **fireguard-web** et adaptée à une app **Ionic/Capacitor**.
Principes : *feature-first*, `core` = infrastructure uniquement, contrats publiés via **ports + tokens**,
unités au plus bas niveau, barrels comme seule surface publique.

## Couches

```
app shell (app.config.ts, app.routes.ts)
  → core/        infrastructure app-wide (jamais de métier, n'importe jamais features)
  → layouts/     coquilles de composition (tabs-layout) — pas de métier
  → features/    workflows métier de bout en bout
  → shared/      primitives UI génériques, domain-agnostic
```

Sens des dépendances : `app → core, layouts, features, shared` · `features → core, shared, API publiques sœurs` ·
`core → core uniquement` · `shared → shared`.

## Arborescence

```
src/app/
  app.config.ts                composition root (tous les providers)
  app.routes.ts                tabs → loadChildren des features
  core/
    config/environment/        ENV_CONFIG (interface + token + provider)
    feedback/                  toasts/alertes/loaders (provideFeedback)
    geolocation/               wrapper Geolocation (+ modèle Coordinates)
    geocoding/                 reverse geocoding Mapbox
    permissions/               permissions natives
  layouts/tabs-layout/         barre d'onglets
  features/
    photos/                    DOMAINE photo (possédé)
      models/user-photo/       UserPhoto (type-only)
      data-access/…/photo-storage    persistance Filesystem + Preferences
      services/photo/          orchestration + état (signals) — adapte le port
      ports/photo-library/     contrat publié (interface + token PHOTO_LIBRARY)
      providers/…              providePhotoLibrary() (useExisting)
      ui/components/photo-detail/     vue plein écran (défi 2)
    gallery/  map/  shop/       un onglet = une feature (ui/pages + <feature>.routes.ts)
  shared/components/
    skeleton-card/             primitive générique (défi 4)
    camera-modal/              <pwa-camera-modal> (élément custom Camera 8)
```

## Conventions

- **Concern-first** : chaque service vit dans `…/<concern>/services/<name>/<name>.service.ts`
  (pas de bucket plat `core/services/`).
- **Suffixes** : `.service.ts`, `.interface.ts`, `.type.ts`, `.token.ts`, `.provider.ts`,
  `.routes.ts`, `.component.ts`. `models/` est **type-only**.
- **Barrels** `index.ts` = seule surface publique ; imports profonds interdits.
- **Alias** `@core/*`, `@features/*`, `@shared/*`, `@layouts/*` pour le cross-boundary.
- **Pas de `providedIn: 'root'`** : provisionnement décidé au composition root
  (`app.config.ts`) ou au niveau de la route (ex. `MapService`, `PaymentService`).
- **Ports & adaptateurs** : `PhotoService implements PhotoLibrary`, lié au token
  `PHOTO_LIBRARY` via `{ provide, useExisting }`. `gallery`/`map`/`shop` injectent le token.

## Qualité de code

Même exigence que fireguard-web :

- **TypeScript ultra-strict** (`tsconfig.json`) : `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noPropertyAccessFromIndexSignature`, `isolatedModules`, + Angular `strictTemplates`,
  `strictStandalone`, `typeCheckHostBindings`. Aucun `any`, aucun `!` (non-null assertion).
- **Lint** : `oxlint` (`.oxlintrc.json`) — `no-explicit-any`, `no-non-null-assertion`,
  `no-floating-promises`, `no-console`, `no-unused-vars`… → `npm run lint` (0 erreur).
- **Format** : `oxfmt` (`.oxfmtrc.json`, 100 colonnes, single quotes, tri des imports) →
  `npm run format`.
- **JSDoc complet** sur chaque classe / propriété / méthode (`@description`, `@param`,
  `@returns`, `@access`, `@since`, `@version`, `@author`), avec marqueurs `//#region`.
- **Bonnes pratiques** : modificateurs d'accès explicites, types explicites, `import type`,
  `inject<T>()`, promesses toujours `await`/`void`, état exposé en **signals** lecture seule.

## Déviations assumées vs. fireguard-web

| fireguard-web | SnapMap | Pourquoi |
|---------------|---------|----------|
| PrimeNG | **Ionic/Capacitor** | sujet du concours |
| NgRx Signal Store | **signals Angular** dans les services | proportionné à la taille de l'app |
| `HydraApiService` (API Platform) | **`HttpClient`** dans `data-access` | pas de backend Hydra (juste Stripe) |
| SSR / Mercure / i18n | non repris | hors périmètre du concours |
| `testing/` spec colocalisés | convention documentée, specs non fournies | app de concours sans tests existants |
