import { Component, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Stripe as CapacitorStripe } from '@capacitor-community/stripe';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ENV_CONFIG } from '@core/config';
import type { EnvironmentConfig } from '@core/config';

/**
 * Component AppComponent
 * @class AppComponent
 *
 * @description
 * Root component hosting the Ionic application shell and router outlet. Card
 * payments are loaded on demand by the payment sheet (Card Element via
 * `@stripe/stripe-js`). On a **native** platform we additionally initialize the
 * `@capacitor-community/stripe` plugin so the sheet can offer **native Google Pay**
 * (the web Payment Request button does not work inside an Android WebView).
 *
 * @version 3.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-root',
  template: `<ion-app><ion-router-outlet></ion-router-outlet></ion-app>`,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  //#region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Initializes the native Stripe plugin (Google Pay) on device only.
   *
   * @access public
   * @since 3.0.0
   */
  public constructor() {
    if (Capacitor.isNativePlatform()) {
      const env: EnvironmentConfig = inject<EnvironmentConfig>(ENV_CONFIG);
      void CapacitorStripe.initialize({ publishableKey: env.stripe.publishableKey });
    }
  }
  //#endregion
}
