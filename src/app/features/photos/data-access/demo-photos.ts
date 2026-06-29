import type { UserPhoto } from '@features/photos/models';

/**
 * Constant DAY_MS
 *
 * @description
 * Number of milliseconds in a day (used to spread demo capture dates).
 *
 * @since 3.1.0
 */
const DAY_MS = 86_400_000;

/**
 * Function buildDemoPhotos
 * @function buildDemoPhotos
 *
 * @description
 * Returns a fresh set of bundled demo photos (real images under `assets/demo/`)
 * used to populate the app on first launch, when no real capture exists yet —
 * a simulator/browser cannot use the camera, so this showcases the feed, map
 * and shop with real content (mirrors the reference demo video). Each call
 * returns new objects so the orchestrator can mutate them (like/purchase)
 * freely. They are never written to disk: as soon as a real photo is captured
 * and persisted, the demos drop out on the next load.
 *
 * @since 3.1.0
 *
 * @returns {UserPhoto[]} Fresh demo photos.
 */
export function buildDemoPhotos(): UserPhoto[] {
  const now: number = Date.now();

  const make = (
    index: number,
    place: string,
    lat: number,
    lng: number,
    liked: boolean,
    purchased: boolean,
  ): UserPhoto => ({
    id: `demo-${index}`,
    filepath: `assets/demo/demo-${index}.jpg`,
    webviewPath: `assets/demo/demo-${index}.jpg`,
    lat,
    lng,
    date: now - index * DAY_MS,
    liked,
    purchased,
    locationName: place,
  });

  return [
    make(1, 'Aix-en-Provence, Place des Cardeurs', 43.5297, 5.4474, true, true),
    make(2, 'Marseille, Vieux-Port', 43.2951, 5.3739, false, false),
    make(3, 'Paris, Montmartre', 48.8867, 2.3431, true, false),
    make(4, 'Lyon, Presqu’île', 45.764, 4.8357, false, true),
    make(5, 'Nice, Promenade des Anglais', 43.695, 7.2655, true, false),
    make(6, 'Bordeaux, Miroir d’eau', 44.8412, -0.57, false, false),
  ];
}
