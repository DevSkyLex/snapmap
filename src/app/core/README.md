# `core/` — Infrastructure app-wide

`core/` ne contient que de l'infrastructure transverse, **jamais** de logique métier (celle-ci
appartient à la `feature` qui possède le workflow). `core` ne doit **jamais** importer `features`.

## Organisation concern-first

Chaque préoccupation est un dossier autonome — **pas** de buckets plats type `core/services/` :

```
core/
  config/        ENV_CONFIG (token + provider + interface)
  feedback/      toasts / alertes / loaders (provideFeedback)
  geolocation/   wrapper API Geolocation (+ modèle Coordinates)
  geocoding/     reverse geocoding Mapbox
  permissions/   permissions natives caméra / géoloc
```

Layout interne d'un concern :

```
<concern>/
  services/<name>/<name>.service.ts   (+ testing/ pour les specs)
  models/                             (type-only)
  <concern>.provider.ts               (si binding / token)
  index.ts                            (barrel = seule surface publique)
```

Les services sont provisionnés à la racine (composition root) via leur provider ou la liste
de providers d'`app.config.ts`, **pas** via `providedIn: 'root'`.
