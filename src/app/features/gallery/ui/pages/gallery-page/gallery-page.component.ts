import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, type OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, checkmarkCircle, heart, heartOutline, imagesOutline } from 'ionicons/icons';
import { FeedbackService } from '@core/feedback';
import { GeocodingService } from '@core/geocoding';
import { PermissionsService } from '@core/permissions';
import { PHOTO_LIBRARY, PhotoDetailComponent } from '@features/photos';
import type { PhotoLibrary, UserPhoto } from '@features/photos';
import { SkeletonCardComponent } from '@shared/components';

/**
 * Component GalleryPageComponent
 * @class GalleryPageComponent
 *
 * @description
 * Gallery tab page: an Instagram-style vertical feed of geotagged photo cards
 * (place + date header, large photo, like, purchased badge). Capture lives in
 * the floating "Snap" button; the detail view (challenge 2) opens on tap and
 * hosts like (challenge 1) and confirmed deletion (challenge 1). Orchestrates
 * through the {@link PHOTO_LIBRARY} port.
 *
 * @version 3.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery-page.component.html',
  styleUrls: ['gallery-page.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton,
    DatePipe,
    SkeletonCardComponent,
  ],
})
export class GalleryPageComponent implements OnInit {
  //#region Properties
  /**
   * Property library
   * @readonly
   *
   * @description
   * Photo library port (state + actions).
   *
   * @access protected
   * @since 1.0.0
   *
   * @type {PhotoLibrary}
   */
  protected readonly library: PhotoLibrary = inject<PhotoLibrary>(PHOTO_LIBRARY);

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
   * Property permissions
   * @readonly
   *
   * @description
   * Native permissions helper.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {PermissionsService}
   */
  private readonly permissions: PermissionsService = inject<PermissionsService>(PermissionsService);

  /**
   * Property geocoding
   * @readonly
   *
   * @description
   * Reverse geocoding service (resolves each card's place name).
   *
   * @access private
   * @since 3.0.0
   *
   * @type {GeocodingService}
   */
  private readonly geocoding: GeocodingService = inject<GeocodingService>(GeocodingService);

  /**
   * Property modalController
   * @readonly
   *
   * @description
   * Ionic modal controller.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {ModalController}
   */
  private readonly modalController: ModalController = inject<ModalController>(ModalController);

  /**
   * Property changeDetector
   * @readonly
   *
   * @description
   * Change detector used to refresh the feed once place names resolve.
   *
   * @access private
   * @since 3.0.0
   *
   * @type {ChangeDetectorRef}
   */
  private readonly changeDetector: ChangeDetectorRef = inject<ChangeDetectorRef>(ChangeDetectorRef);
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
    addIcons({ camera, checkmarkCircle, heart, heartOutline, imagesOutline });
  }
  //#endregion

  //#region Lifecycle
  /**
   * Method ngOnInit
   * @method ngOnInit
   *
   * @description
   * Loads persisted photos then resolves their place names.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<void>} Resolves once photos are loaded.
   */
  public async ngOnInit(): Promise<void> {
    await this.library.loadSaved();
    void this.resolvePlaces();
  }
  //#endregion

  //#region Public Methods
  /**
   * Method takePhoto
   * @method takePhoto
   *
   * @description
   * Ensures camera permission then captures a new photo.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<void>} Resolves once the capture flow completes.
   */
  public async takePhoto(): Promise<void> {
    const granted: boolean = await this.permissions.ensureCamera();
    if (!granted) {
      await this.feedback.alert(
        'Caméra refusée',
        "Autorisez l'accès à la caméra dans les réglages pour prendre des photos.",
      );
      return;
    }

    try {
      const photo: UserPhoto | null = await this.library.takePhoto();
      if (photo) {
        await this.feedback.toast('Photo ajoutée 📸', 'success');
        void this.resolvePlaces();
      }
    } catch {
      // Capture cancelled by the user: nothing to do.
    }
  }

  /**
   * Method toggleLike
   * @method toggleLike
   *
   * @description
   * Toggles the liked state of a photo from its feed card.
   *
   * @access public
   * @since 3.0.0
   *
   * @param {UserPhoto} photo - The photo to toggle.
   * @param {Event} event - The originating click event.
   *
   * @returns {Promise<void>} Resolves once persisted.
   */
  public async toggleLike(photo: UserPhoto, event: Event): Promise<void> {
    event.stopPropagation();
    await this.library.toggleLike(photo);
  }

  /**
   * Method openDetail
   * @method openDetail
   *
   * @description
   * Opens the full-screen detail view at the given photo.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {UserPhoto} photo - The photo to open.
   *
   * @returns {Promise<void>} Resolves once the modal is presented.
   */
  public async openDetail(photo: UserPhoto): Promise<void> {
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
   * Method resolvePlaces
   * @method resolvePlaces
   *
   * @description
   * Reverse-geocodes the place name of every located photo missing one, then
   * refreshes the feed (OnPush) once resolved. Failures are swallowed so a
   * missing Mapbox token simply leaves the fallback label.
   *
   * @access private
   * @since 3.0.0
   *
   * @returns {Promise<void>} Resolves once all lookups settle.
   */
  private async resolvePlaces(): Promise<void> {
    await Promise.all(
      this.library.photos().map(async (photo: UserPhoto) => {
        if (photo.locationName || photo.lat === null || photo.lng === null) return;
        try {
          photo.locationName = await this.geocoding.reverseGeocode(photo.lng, photo.lat);
        } catch {
          // Place unavailable (e.g. missing token): keep the fallback label.
        }
      }),
    );
    this.changeDetector.markForCheck();
  }
  //#endregion
}
