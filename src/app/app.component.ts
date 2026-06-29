import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Stripe } from '@capacitor-community/stripe';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ENV_CONFIG } from '@core/config';
import type { EnvironmentConfig } from '@core/config';

/**
 * Component AppComponent
 * @class AppComponent
 *
 * @description
 * Root component hosting the Ionic application shell and router outlet.
 * Initializes the Stripe SDK with the publishable key (front-end only).
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-root',
  template: `<ion-app><ion-router-outlet></ion-router-outlet></ion-app>`,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  //#region Properties
  /**
   * Property env
   * @readonly
   *
   * @description
   * Application environment (Stripe publishable key).
   *
   * @access private
   * @since 1.0.0
   *
   * @type {EnvironmentConfig}
   */
  private readonly env: EnvironmentConfig = inject<EnvironmentConfig>(ENV_CONFIG);
  //#endregion

  //#region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Initializes Stripe with the publishable key. Initialization failures are
   * swallowed (the SDK is not available in every web context).
   *
   * @access public
   * @since 1.0.0
   */
  public constructor() {
    void Stripe.initialize({ publishableKey: this.env.stripe.publishableKey }).catch(
      () => undefined,
    );
  }
  //#endregion
}
