/**
 * Interface PaymentSheetResponse
 * @interface PaymentSheetResponse
 *
 * @description
 * Transport contract returned by the Express backend (`POST /payment-sheet`) to
 * initialize the Stripe PaymentSheet. Type-only, `readonly`.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export interface PaymentSheetResponse {
  /**
   * Property paymentIntent
   * @readonly
   *
   * @description
   * The PaymentIntent client secret.
   *
   * @since 1.0.0
   *
   * @type {string}
   */
  readonly paymentIntent: string;

  /**
   * Property ephemeralKey
   * @readonly
   *
   * @description
   * The customer's ephemeral key secret.
   *
   * @since 1.0.0
   *
   * @type {string}
   */
  readonly ephemeralKey: string;

  /**
   * Property customer
   * @readonly
   *
   * @description
   * The Stripe customer id.
   *
   * @since 1.0.0
   *
   * @type {string}
   */
  readonly customer: string;
}
