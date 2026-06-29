import { type Routes } from '@angular/router';
import { PaymentApiService } from '@features/shop/data-access';
import { PaymentService } from '@features/shop/services/payment/payment.service';

/**
 * Constant SHOP_ROUTES
 *
 * @description
 * Routes of the "shop" feature (tab 3). The payment services are provisioned at
 * the route level (scoped to the shop).
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export const SHOP_ROUTES: Routes = [
  {
    path: '',
    providers: [PaymentApiService, PaymentService],
    loadComponent: () =>
      import('@features/shop/ui/pages/shop-page/shop-page.component').then(
        (m) => m.ShopPageComponent,
      ),
  },
];
