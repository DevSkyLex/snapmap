import { type Routes } from '@angular/router';

/**
 * Constant routes
 *
 * @description
 * Top-level application routes: the tabs layout lazy-loads each feature's routes.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('@layouts/tabs-layout').then((m) => m.TabsLayoutComponent),
    children: [
      {
        path: 'gallery',
        loadChildren: () => import('@features/gallery').then((m) => m.GALLERY_ROUTES),
      },
      {
        path: 'map',
        loadChildren: () => import('@features/map').then((m) => m.MAP_ROUTES),
      },
      {
        path: 'shop',
        loadChildren: () => import('@features/shop').then((m) => m.SHOP_ROUTES),
      },
      { path: '', redirectTo: 'gallery', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'tabs/gallery', pathMatch: 'full' },
];
