/**
 * Interface EnvironmentConfig
 * @interface EnvironmentConfig
 *
 * @description
 * Typed shape of the application's environment configuration, provided through
 * the {@link ENV_CONFIG} injection token. Type-only — no runtime code here.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export interface EnvironmentConfig {
  /**
   * Property production
   * @readonly
   *
   * @description
   * Whether the build runs in production mode.
   *
   * @since 1.0.0
   *
   * @type {boolean}
   */
  readonly production: boolean;

  /**
   * Property api
   * @readonly
   *
   * @description
   * Base URL of the Express backend that issues Stripe PaymentIntents
   * (trailing slash included, e.g. `http://localhost:4000/`).
   *
   * @since 1.0.0
   *
   * @type {string}
   */
  readonly api: string;

  /**
   * Property mapBox
   * @readonly
   *
   * @description
   * Mapbox configuration (public access token).
   *
   * @since 1.0.0
   *
   * @type {{ readonly accessToken: string }}
   */
  readonly mapBox: {
    readonly accessToken: string;
  };

  /**
   * Property stripe
   * @readonly
   *
   * @description
   * Stripe front-end configuration (publishable key only — never the secret key).
   *
   * @since 1.0.0
   *
   * @type {{ readonly publishableKey: string }}
   */
  readonly stripe: {
    readonly publishableKey: string;
  };
}
