import { type Routes } from '@angular/router';

/**
 * Constant SHOP_ROUTES
 *
 * @description
 * Routes of the "shop" feature (tab 3). The payment services are provisioned by
 * the payment sheet component itself (it is presented as a root-level overlay),
 * so no route-level providers are required here.
 *
 * @version 2.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export const SHOP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/shop/ui/pages/shop-page/shop-page.component').then(
        (m) => m.ShopPageComponent,
      ),
  },
];
