import { Component, computed, inject, type OnInit, signal, type WritableSignal } from '@angular/core';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForward,
  bagHandleOutline,
  cardOutline,
  checkmarkCircle,
  downloadOutline,
  location,
  lockClosed,
  sparkles,
} from 'ionicons/icons';
import { FeedbackService } from '@core/feedback';
import { PHOTO_LIBRARY, PhotoDetailComponent } from '@features/photos';
import type { PhotoLibrary, UserPhoto } from '@features/photos';
import { PaymentSheetComponent } from '@features/shop/ui/components/payment-sheet/payment-sheet.component';

/**
 * Type ShopFilter
 * @typedef {('all' | 'locked' | 'purchased')} ShopFilter
 *
 * @description
 * The active shop filter chip.
 *
 * @since 3.0.0
 */
type ShopFilter = 'all' | 'locked' | 'purchased';

/**
 * Interface BundleOffer
 * @interface BundleOffer
 *
 * @description
 * A "unlock everything at this place" offer: the place with the most locked
 * photos, with a discounted price.
 *
 * @since 3.0.0
 */
interface BundleOffer {
  readonly place: string;
  readonly count: number;
  readonly ids: ReadonlyArray<string>;
  readonly price: number;
  readonly original: number;
}

/**
 * Constant UNIT_PRICE
 *
 * @description
 * Price of a single photo, in euros.
 *
 * @since 3.0.0
 */
const UNIT_PRICE = 5;

/**
 * Component ShopPageComponent
 * @class ShopPageComponent
 *
 * @description
 * Shop tab page: a portrait grid of geotagged photos (locked behind a blur,
 * unlocked in HD), a "all / locked / purchased" filter, purchase counters and a
 * place-bundle offer. Purchases open the on-brand {@link PaymentSheetComponent}
 * (Stripe Card Element); success unlocks the photo(s) with toast feedback
 * (challenge 4).
 *
 * @version 3.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-shop',
  templateUrl: 'shop-page.component.html',
  styleUrls: ['shop-page.component.scss'],
  imports: [IonContent, IonIcon],
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
   * Property filter
   * @readonly
   *
   * @description
   * The active filter chip.
   *
   * @access protected
   * @since 3.0.0
   *
   * @type {WritableSignal<ShopFilter>}
   */
  protected readonly filter: WritableSignal<ShopFilter> = signal<ShopFilter>('all');

  /**
   * Property lockedCount
   * @readonly
   *
   * @description
   * Number of locked (un-purchased) photos.
   *
   * @access protected
   * @since 3.0.0
   */
  protected readonly lockedCount = computed<number>(
    () => this.library.photos().filter((photo: UserPhoto) => !photo.purchased).length,
  );

  /**
   * Property purchasedCount
   * @readonly
   *
   * @description
   * Number of purchased photos.
   *
   * @access protected
   * @since 3.0.0
   */
  protected readonly purchasedCount = computed<number>(
    () => this.library.photos().filter((photo: UserPhoto) => photo.purchased).length,
  );

  /**
   * Property visiblePhotos
   * @readonly
   *
   * @description
   * The photos shown for the active filter.
   *
   * @access protected
   * @since 3.0.0
   */
  protected readonly visiblePhotos = computed<ReadonlyArray<UserPhoto>>(() => {
    const photos: ReadonlyArray<UserPhoto> = this.library.photos();
    if (this.filter() === 'locked') return photos.filter((photo: UserPhoto) => !photo.purchased);
    if (this.filter() === 'purchased') return photos.filter((photo: UserPhoto) => photo.purchased);
    return photos;
  });

  /**
   * Property bundle
   * @readonly
   *
   * @description
   * The best place-bundle offer (the place with the most locked photos, ≥ 2),
   * or `null` when none qualifies.
   *
   * @access protected
   * @since 3.0.0
   */
  protected readonly bundle = computed<BundleOffer | null>(() => {
    const groups = new Map<string, UserPhoto[]>();
    for (const photo of this.library.photos()) {
      if (photo.purchased) continue;
      const place: string = photo.locationName || 'Lieu enregistré';
      groups.set(place, [...(groups.get(place) ?? []), photo]);
    }

    let best: { place: string; photos: UserPhoto[] } | null = null;
    for (const [place, photos] of groups) {
      if (photos.length >= 2 && (!best || photos.length > best.photos.length)) best = { place, photos };
    }
    if (!best) return null;

    const original: number = best.photos.length * UNIT_PRICE;
    return {
      place: best.place,
      count: best.photos.length,
      ids: best.photos.map((photo: UserPhoto) => photo.id),
      price: Math.max(UNIT_PRICE, Math.round(original * 0.75)),
      original,
    };
  });

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

  /**
   * Property modalController
   * @readonly
   *
   * @description
   * Ionic modal controller (presents the payment sheet and the viewer).
   *
   * @access private
   * @since 2.0.0
   *
   * @type {ModalController}
   */
  private readonly modalController: ModalController = inject<ModalController>(ModalController);
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
    addIcons({
      arrowForward,
      bagHandleOutline,
      cardOutline,
      checkmarkCircle,
      downloadOutline,
      location,
      lockClosed,
      sparkles,
    });
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
   * Method setFilter
   * @method setFilter
   *
   * @description
   * Switches the active filter chip.
   *
   * @access public
   * @since 3.0.0
   *
   * @param {ShopFilter} value - The filter to activate.
   *
   * @returns {void} Nothing.
   */
  public setFilter(value: ShopFilter): void {
    this.filter.set(value);
  }

  /**
   * Method buyPhoto
   * @method buyPhoto
   *
   * @description
   * Opens the payment sheet for a single photo; unlocks it on success.
   *
   * @access public
   * @since 2.0.0
   *
   * @param {UserPhoto} photo - The photo to unlock.
   *
   * @returns {Promise<void>} Resolves once the flow completes.
   */
  public async buyPhoto(photo: UserPhoto): Promise<void> {
    const paid: boolean = await this.openPaymentSheet(
      photo.webviewPath,
      'Débloquer la photo',
      photo.locationName || 'SnapMap',
      UNIT_PRICE,
    );
    if (paid) {
      await this.library.markAsPurchased(photo.id);
      await this.feedback.toast('Paiement réussi 🎉 photo débloquée', 'success');
    }
  }

  /**
   * Method buyBundle
   * @method buyBundle
   *
   * @description
   * Opens the payment sheet for a whole place bundle; unlocks every photo of that
   * place on success.
   *
   * @access public
   * @since 3.0.0
   *
   * @param {BundleOffer} offer - The bundle to purchase.
   *
   * @returns {Promise<void>} Resolves once the flow completes.
   */
  public async buyBundle(offer: BundleOffer): Promise<void> {
    const cover: string =
      this.library.photos().find((photo: UserPhoto) => photo.id === offer.ids[0])?.webviewPath ?? '';
    const paid: boolean = await this.openPaymentSheet(
      cover,
      `Tout débloquer · ${offer.place}`,
      `${offer.count} photos`,
      offer.price,
    );
    if (paid) {
      await Promise.all(offer.ids.map((id: string) => this.library.markAsPurchased(id)));
      await this.feedback.toast(`${offer.count} photos débloquées 🎉`, 'success');
    }
  }

  /**
   * Method openPhoto
   * @method openPhoto
   *
   * @description
   * Opens the full-screen viewer at a purchased photo (HD view).
   *
   * @access public
   * @since 3.0.0
   *
   * @param {UserPhoto} photo - The photo to view.
   *
   * @returns {Promise<void>} Resolves once the viewer is presented.
   */
  public async openPhoto(photo: UserPhoto): Promise<void> {
    const photos: UserPhoto[] = [...this.library.photos()];
    const startIndex: number = photos.indexOf(photo);

    const modal: HTMLIonModalElement = await this.modalController.create({
      component: PhotoDetailComponent,
      componentProps: { photos, startIndex },
    });
    await modal.present();
  }
  //#endregion

  //#region Private Methods
  /**
   * Method openPaymentSheet
   * @method openPaymentSheet
   *
   * @description
   * Presents the on-brand payment sheet and resolves whether it succeeded.
   *
   * @access private
   * @since 3.0.0
   *
   * @param {string} imageUrl - The thumbnail shown in the sheet.
   * @param {string} title - The sheet title.
   * @param {string} subtitle - The sheet subtitle.
   * @param {number} euros - The amount in euros.
   *
   * @returns {Promise<boolean>} `true` when the payment succeeded.
   */
  private async openPaymentSheet(
    imageUrl: string,
    title: string,
    subtitle: string,
    euros: number,
  ): Promise<boolean> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: PaymentSheetComponent,
      componentProps: {
        imageUrl,
        title,
        subtitle,
        amount: `${euros},00 €`,
        amountCents: euros * 100,
      },
      cssClass: 'sheet-modal',
      breakpoints: [0, 0.92, 1],
      initialBreakpoint: 0.92,
      handle: true,
    });
    await modal.present();

    const result = await modal.onDidDismiss<{ paid?: boolean }>();
    return result.data?.paid ?? false;
  }
  //#endregion
}
