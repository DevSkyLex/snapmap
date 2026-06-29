import { inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Stripe as CapacitorStripe, GooglePayEventsEnum } from '@capacitor-community/stripe';
import {
  loadStripe,
  type Stripe,
  type StripeCardNumberElement,
  type StripeElements,
  type StripeElementStyle,
} from '@stripe/stripe-js';
import { ENV_CONFIG } from '@core/config';
import type { EnvironmentConfig } from '@core/config';
import { PaymentApiService } from '@features/shop/data-access';
import type { PaymentSheetResponse } from '@features/shop/models';

/**
 * Interface CardPaymentSetup
 * @interface CardPaymentSetup
 *
 * @description
 * Everything the payment sheet needs to mount its card fields and confirm.
 *
 * @since 3.0.0
 */
export interface CardPaymentSetup {
  readonly stripe: Stripe;
  readonly elements: StripeElements;
  readonly clientSecret: string;
}

/**
 * Interface PaymentOutcome
 * @interface PaymentOutcome
 *
 * @description
 * Result of a card confirmation: success flag with an optional error message.
 *
 * @since 3.0.0
 */
export interface PaymentOutcome {
  readonly ok: boolean;
  readonly message?: string;
}

/**
 * Service PaymentService
 * @class PaymentService
 *
 * @description
 * Behavioral service of the "shop" feature: orchestrates the Stripe flow with the
 * official **split Card Element** (`@stripe/stripe-js`) so the fields can be drawn
 * inside SnapMap's own field boxes (full color control, matches the design).
 * Transport stays in {@link PaymentApiService}.
 *
 * @version 3.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Injectable()
export class PaymentService {
  //#region Properties
  /**
   * Property env
   * @readonly
   *
   * @description
   * Application environment (Stripe publishable key).
   *
   * @access private
   * @since 2.0.0
   *
   * @type {EnvironmentConfig}
   */
  private readonly env: EnvironmentConfig = inject<EnvironmentConfig>(ENV_CONFIG);

  /**
   * Property api
   * @readonly
   *
   * @description
   * Stripe transport service (PaymentIntent creation).
   *
   * @access private
   * @since 1.0.0
   *
   * @type {PaymentApiService}
   */
  private readonly api: PaymentApiService = inject<PaymentApiService>(PaymentApiService);

  /**
   * Property stripePromise
   *
   * @description
   * Memoized `Stripe` instance (the SDK is loaded once).
   *
   * @access private
   * @since 2.0.0
   *
   * @type {Promise<Stripe | null> | undefined}
   */
  private stripePromise: Promise<Stripe | null> | undefined;
  //#endregion

  //#region Methods
  /**
   * Method prepare
   * @method prepare
   *
   * @description
   * Loads Stripe, creates the PaymentIntent and an `Elements` group ready to host
   * the split card fields.
   *
   * @access public
   * @since 3.0.0
   *
   * @returns {Promise<CardPaymentSetup>} The Stripe instance, Elements and client secret.
   *
   * @throws When Stripe fails to load or the backend is unreachable.
   */
  public async prepare(): Promise<CardPaymentSetup> {
    const stripe: Stripe | null = await this.loadSdk();
    if (!stripe) throw new Error('Stripe SDK unavailable');

    const sheet: PaymentSheetResponse = await this.api.createPaymentSheet();
    const elements: StripeElements = stripe.elements();

    return { stripe, elements, clientSecret: sheet.paymentIntent };
  }

  /**
   * Method fieldStyle
   * @method fieldStyle
   *
   * @description
   * SnapMap text styling for the Stripe card fields (ink text, teal icon, muted
   * placeholder), adapting to the current colour scheme. Stripe only renders the
   * typed text — the field box is styled by us.
   *
   * @access public
   * @since 3.0.0
   *
   * @returns {StripeElementStyle} The element style.
   */
  public fieldStyle(): StripeElementStyle {
    const dark: boolean = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

    return {
      base: {
        color: dark ? '#f2f4f8' : '#0e1726',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontSize: '16px',
        fontWeight: '600',
        iconColor: '#00a294',
        '::placeholder': { color: dark ? '#6b7686' : '#8a93a2' },
      },
      invalid: { color: '#ff4d6d', iconColor: '#ff4d6d' },
    };
  }

  /**
   * Method confirm
   * @method confirm
   *
   * @description
   * Confirms the card payment against the PaymentIntent.
   *
   * @access public
   * @since 3.0.0
   *
   * @param {Stripe} stripe - The Stripe instance.
   * @param {string} clientSecret - The PaymentIntent client secret.
   * @param {StripeCardNumberElement} card - The mounted card number element.
   * @param {string} [postalCode] - The billing postal code, if collected.
   *
   * @returns {Promise<PaymentOutcome>} The outcome (success + optional message).
   */
  public async confirm(
    stripe: Stripe,
    clientSecret: string,
    card: StripeCardNumberElement,
    postalCode?: string,
  ): Promise<PaymentOutcome> {
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: postalCode ? { address: { postal_code: postalCode } } : undefined,
      },
    });

    if (error) return { ok: false, message: error.message };
    return { ok: paymentIntent?.status === 'succeeded' };
  }

  /**
   * Method isGooglePayReady
   * @method isGooglePayReady
   *
   * @description
   * Whether **native** Google Pay is available on this device. Always `false` on
   * the web (there the Card Element handles everything), since the native plugin
   * is the only way to surface a working Google Pay inside an Android WebView.
   *
   * @access public
   * @since 4.0.0
   *
   * @returns {Promise<boolean>} `true` when native Google Pay can be presented.
   */
  public async isGooglePayReady(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      await CapacitorStripe.isGooglePayAvailable();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Method payWithGooglePay
   * @method payWithGooglePay
   *
   * @description
   * Presents the native Google Pay sheet for the given PaymentIntent and resolves
   * the outcome. Cancellation is reported as a silent failure (no error message).
   *
   * @access public
   * @since 4.0.0
   *
   * @param {string} clientSecret - The PaymentIntent client secret.
   *
   * @returns {Promise<PaymentOutcome>} The outcome (success + optional message).
   */
  public async payWithGooglePay(clientSecret: string): Promise<PaymentOutcome> {
    try {
      await CapacitorStripe.createGooglePay({ paymentIntentClientSecret: clientSecret });
      const { paymentResult } = await CapacitorStripe.presentGooglePay();

      if (paymentResult === GooglePayEventsEnum.Completed) return { ok: true };
      if (paymentResult === GooglePayEventsEnum.Canceled) return { ok: false };
      return { ok: false, message: 'Paiement Google Pay non abouti.' };
    } catch {
      return { ok: false, message: 'Google Pay indisponible sur cet appareil.' };
    }
  }

  /**
   * Method loadSdk
   * @method loadSdk
   *
   * @description
   * Loads (once) the Stripe SDK with the publishable key.
   *
   * @access private
   * @since 2.0.0
   *
   * @returns {Promise<Stripe | null>} The Stripe instance, or `null` on failure.
   */
  private loadSdk(): Promise<Stripe | null> {
    this.stripePromise ??= loadStripe(this.env.stripe.publishableKey);
    return this.stripePromise;
  }
  //#endregion
}
