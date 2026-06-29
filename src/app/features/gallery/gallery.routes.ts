import { type Routes } from '@angular/router';

/**
 * Constant GALLERY_ROUTES
 *
 * @description
 * Routes of the "gallery" feature (tab 1).
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export const GALLERY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/gallery/ui/pages/gallery-page/gallery-page.component').then(
        (m) => m.GalleryPageComponent,
      ),
  },
];
