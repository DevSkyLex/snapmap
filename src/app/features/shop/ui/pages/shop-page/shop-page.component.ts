import { Component, inject, type OnInit } from '@angular/core';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosed, lockOpen } from 'ionicons/icons';
import { FeedbackService } from '@core/feedback';
import { PHOTO_LIBRARY } from '@features/photos';
import type { PhotoLibrary } from '@features/photos';
import { PaymentService } from '@features/shop/services/payment/payment.service';

/**
 * Component ShopPageComponent
 * @class ShopPageComponent
 *
 * @description
 * Shop tab page: blurred grid of un-purchased photos, single-photo purchase
 * (card / Google Pay) via the {@link PaymentService}, with toast feedback
 * (challenge 4).
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-shop',
  templateUrl: 'shop-page.component.html',
  styleUrls: ['shop-page.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
  ],
})
export class ShopPageComponent implements OnInit {
  //#region Properties
  /**
   * Property library
   * @readonly
   *
   * @description
   * Photo library port (state + purchase flag).
   *
   * @access protected
   * @since 1.0.0
   *
   * @type {PhotoLibrary}
   */
  protected readonly library: PhotoLibrary = inject<PhotoLibrary>(PHOTO_LIBRARY);

  /**
   * Property paymentService
   * @readonly
   *
   * @description
   * Stripe payment orchestration service (route-scoped).
   *
   * @access private
   * @since 1.0.0
   *
   * @type {PaymentService}
   */
  private readonly paymentService: PaymentService = inject<PaymentService>(PaymentService);

  /**
   * Property feedback
   * @readonly
   *
   * @description
   * User feedback service.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {FeedbackService}
   */
  private readonly feedback: FeedbackService = inject<FeedbackService>(FeedbackService);
  //#endregion

  //#region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers the icons used by the template.
   *
   * @access public
   * @since 1.0.0
   */
  public constructor() {
    addIcons({ lockClosed, lockOpen });
  }
  //#endregion

  //#region Lifecycle
  /**
   * Method ngOnInit
   * @method ngOnInit
   *
   * @description
   * Loads persisted photos.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<void>} Resolves once photos are loaded.
   */
  public async ngOnInit(): Promise<void> {
    await this.library.loadSaved();
  }
  //#endregion

  //#region Public Methods
  /**
   * Method buyPhoto
   * @method buyPhoto
   *
   * @description
   * Buys a photo by card.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {string} id - The id of the photo to buy.
   *
   * @returns {Promise<void>} Resolves once the purchase flow completes.
   */
  public async buyPhoto(id: string): Promise<void> {
    await this.runPurchase(() => this.paymentService.buyPhoto(), id);
  }

  /**
   * Method buyPhotoWithGooglePay
   * @method buyPhotoWithGooglePay
   *
   * @description
   * Buys a photo with Google Pay.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {string} id - The id of the photo to buy.
   *
   * @returns {Promise<void>} Resolves once the purchase flow completes.
   */
  public async buyPhotoWithGooglePay(id: string): Promise<void> {
    await this.runPurchase(() => this.paymentService.buyPhotoWithGooglePay(), id);
  }
  //#endregion

  //#region Private Methods
  /**
   * Method runPurchase
   * @method runPurchase
   *
   * @description
   * Runs a purchase flow and applies its outcome (unlock + feedback).
   *
   * @access private
   * @since 1.0.0
   *
   * @param {() => Promise<boolean>} flow - The Stripe flow to run.
   * @param {string} id - The id of the photo being purchased.
   *
   * @returns {Promise<void>} Resolves once the outcome is applied.
   */
  private async runPurchase(flow: () => Promise<boolean>, id: string): Promise<void> {
    try {
      const success: boolean = await flow();
      if (success) {
        await this.library.markAsPurchased(id);
        await this.feedback.toast('Paiement réussi 🎉 photo débloquée', 'success');
      } else {
        await this.feedback.toast('Paiement non abouti', 'warning');
      }
    } catch {
      await this.feedback.alert(
        'Erreur de paiement',
        "Le backend Stripe est-il lancé ? Vérifiez l'URL de l'API (environment.api).",
      );
    }
  }
  //#endregion
}
