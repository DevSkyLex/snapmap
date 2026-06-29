import { type Routes } from '@angular/router';
import { MapService } from '@features/map/services/map/map.service';

/**
 * Constant MAP_ROUTES
 *
 * @description
 * Routes of the "map" feature (tab 2). The {@link MapService} is provisioned at
 * the route level (scoped to the map).
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export const MAP_ROUTES: Routes = [
  {
    path: '',
    providers: [MapService],
    loadComponent: () =>
      import('@features/map/ui/pages/map-page/map-page.component').then((m) => m.MapPageComponent),
  },
];
