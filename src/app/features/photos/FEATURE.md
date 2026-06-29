# Feature `photos`

Possède le **domaine photo** de bout en bout : modèle, persistance, état et widgets.
Les features `gallery`, `map` et `shop` la consomment via son API publique (`@features/photos`),
en injectant le **port** `PHOTO_LIBRARY` (jamais le service concret).

## Structure

```
photos/
  models/user-photo/            UserPhoto (view model type-only)
  data-access/services/
    photo-storage/              persistance Filesystem + Preferences (transport)
  services/photo/               orchestration : caméra + géoloc + storage, état en signals
  ports/photo-library/          contrat publié (interface + token)
  providers/photo-library/      providePhotoLibrary() — lie le token à PhotoService
  ui/components/photo-detail/   vue détaillée plein écran (défi 2)
  index.ts                      API publique
```

## Port

`PhotoService implements PhotoLibrary` et est lié au token `PHOTO_LIBRARY` via
`{ provide: PHOTO_LIBRARY, useExisting: PhotoService }` dans `providePhotoLibrary()`
(provisionné au composition root → singleton partagé entre les onglets).

L'état (`photos`, `isCapturing`) est exposé en **signals** en lecture seule.
