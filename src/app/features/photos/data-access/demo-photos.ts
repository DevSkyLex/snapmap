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
 * Constant MIRABEAU
 *
 * @description
 * A deliberately busy place: several demo photos share it so the map forms a
 * cluster (place modal) and the shop shows a place bundle.
 *
 * @since 4.0.0
 */
const MIRABEAU = 'Aix-en-Provence, Cours Mirabeau';

/**
 * Function buildDemoPhotos
 * @function buildDemoPhotos
 *
 * @description
 * Returns a fresh set of bundled demo photos (real images under `assets/demo/`)
 * used to populate the app on first launch, when no real capture exists yet —
 * a simulator/browser cannot use the camera, so this showcases the feed, map
 * and shop with real content. Several photos share one place (Cours Mirabeau) so
 * the map cluster, the place modal and the shop bundle all have content to show.
 * Each call returns new objects so the orchestrator can mutate them
 * (like/purchase) freely. They are never written to disk: as soon as a real
 * photo is captured and persisted, the demos drop out on the next load.
 *
 * @since 3.1.0
 *
 * @returns {UserPhoto[]} Fresh demo photos.
 */
export function buildDemoPhotos(): UserPhoto[] {
  const now: number = Date.now();

  const make = (
    index: number,
    image: number,
    place: string,
    lat: number,
    lng: number,
    liked: boolean,
    purchased: boolean,
  ): UserPhoto => ({
    id: `demo-${index}`,
    filepath: `assets/demo/demo-${image}.jpg`,
    webviewPath: `assets/demo/demo-${image}.jpg`,
    lat,
    lng,
    date: now - index * DAY_MS,
    liked,
    purchased,
    locationName: place,
  });

  return [
    // Lieu animé : Cours Mirabeau (7 photos → cluster + modale « lieu », bundle boutique).
    make(1, 1, MIRABEAU, 43.5283, 5.4497, true, true),
    make(2, 2, MIRABEAU, 43.5285, 5.4501, false, false),
    make(3, 3, MIRABEAU, 43.5281, 5.4493, true, false),
    make(4, 4, MIRABEAU, 43.5287, 5.4499, false, false),
    make(5, 5, MIRABEAU, 43.5279, 5.4503, false, true),
    make(6, 6, MIRABEAU, 43.5289, 5.4495, true, false),
    make(7, 2, MIRABEAU, 43.5277, 5.4498, false, false),
    // Autres lieux (pins isolés sur la carte).
    make(8, 3, 'Marseille, Vieux-Port', 43.2951, 5.3739, false, false),
    make(9, 5, 'Paris, Montmartre', 48.8867, 2.3431, true, false),
    make(10, 6, 'Nice, Promenade des Anglais', 43.695, 7.2655, false, true),
  ];
}
