import { inject, Injectable } from '@angular/core';
import { GooglePayEventsEnum, PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';
import { PaymentApiService } from '@features/shop/data-access';
import type { PaymentSheetResponse } from '@features/shop/models';

/**
 * Service PaymentService
 * @class PaymentService
 *
 * @description
 * Behavioral service of the "shop" feature: orchestrates the Stripe flow
 * (PaymentSheet + Google Pay) on top of {@link PaymentApiService} for transport.
 * Never builds an HTTP request itself.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Injectable()
export class PaymentService {
  //#region Properties
  /**
   * Property api
   * @readonly
   *
   * @description
   * Stripe transport service.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {PaymentApiService}
   */
  private readonly api: PaymentApiService = inject<PaymentApiService>(PaymentApiService);
  //#endregion

  //#region Methods
  /**
   * Method buyPhoto
   * @method buyPhoto
   *
   * @description
   * Runs the card-payment flow (PaymentSheet).
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<boolean>} `true` when the payment is completed.
   */
  public async buyPhoto(): Promise<boolean> {
    const sheet: PaymentSheetResponse = await this.api.createPaymentSheet();

    await Stripe.createPaymentSheet({
      paymentIntentClientSecret: sheet.paymentIntent,
      customerId: sheet.customer,
      customerEphemeralKeySecret: sheet.ephemeralKey,
      merchantDisplayName: 'SnapMap',
      countryCode: 'FR',
    });

    const result = await Stripe.presentPaymentSheet();
    return result.paymentResult === PaymentSheetEventsEnum.Completed;
  }

  /**
   * Method buyPhotoWithGooglePay
   * @method buyPhotoWithGooglePay
   *
   * @description
   * Runs the dedicated Google Pay flow.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<boolean>} `true` when the payment is completed.
   */
  public async buyPhotoWithGooglePay(): Promise<boolean> {
    const sheet: PaymentSheetResponse = await this.api.createPaymentSheet();

    try {
      await Stripe.createGooglePay({
        paymentIntentClientSecret: sheet.paymentIntent,
        paymentSummaryItems: [{ label: 'Photo', amount: 5 }],
        countryCode: 'FR',
        currency: 'EUR',
      });
    } catch {
      return false;
    }

    const result = await Stripe.presentGooglePay();
    return result.paymentResult === GooglePayEventsEnum.Completed;
  }
  //#endregion
}
