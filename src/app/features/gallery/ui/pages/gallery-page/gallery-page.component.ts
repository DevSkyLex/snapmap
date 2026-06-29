import { Component, computed, inject, type OnInit, signal, type WritableSignal } from '@angular/core';
import { IonButton, IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, heart, heartOutline, location } from 'ionicons/icons';
import { FeedbackService } from '@core/feedback';
import { GeocodingService } from '@core/geocoding';
import { PermissionsService } from '@core/permissions';
import { PHOTO_LIBRARY, PhotoDetailComponent } from '@features/photos';
import type { PhotoLibrary, UserPhoto } from '@features/photos';

/**
 * Type GalleryFilter
 * @typedef {('all' | 'liked')} GalleryFilter
 *
 * @description
 * The active gallery filter chip.
 *
 * @since 4.0.0
 */
type GalleryFilter = 'all' | 'liked';

/**
 * Component GalleryPageComponent
 * @class GalleryPageComponent
 *
 * @description
 * Gallery tab page (home): a two-column grid of the user's geotagged photos with
 * an "all / liked" filter, a floating capture button and a tappable like badge on
 * each tile. The detail view (challenge 2) opens on tap and hosts like and
 * confirmed deletion (challenge 1). Orchestrates through the {@link PHOTO_LIBRARY}
 * port.
 *
 * @version 4.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery-page.component.html',
  styleUrls: ['gallery-page.component.scss'],
  imports: [IonContent, IonIcon, IonButton],
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
   * Property filter
   * @readonly
   *
   * @description
   * The active filter chip (`all` / `liked`).
   *
   * @access protected
   * @since 4.0.0
   *
   * @type {WritableSignal<GalleryFilter>}
   */
  protected readonly filter: WritableSignal<GalleryFilter> = signal<GalleryFilter>('all');

  /**
   * Property likedCount
   * @readonly
   *
   * @description
   * Number of liked photos (drives the "Aimées" chip count).
   *
   * @access protected
   * @since 4.0.0
   */
  protected readonly likedCount = computed<number>(
    () => this.library.photos().filter((photo: UserPhoto) => photo.liked).length,
  );

  /**
   * Property visiblePhotos
   * @readonly
   *
   * @description
   * The photos shown in the grid for the current filter.
   *
   * @access protected
   * @since 4.0.0
   */
  protected readonly visiblePhotos = computed<ReadonlyArray<UserPhoto>>(() =>
    this.filter() === 'liked'
      ? this.library.photos().filter((photo: UserPhoto) => photo.liked)
      : this.library.photos(),
  );

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
   * Reverse geocoding service (resolves place names lazily).
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
    addIcons({ camera, heart, heartOutline, location });
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
   * Method setFilter
   * @method setFilter
   *
   * @description
   * Switches the active filter chip.
   *
   * @access public
   * @since 4.0.0
   *
   * @param {GalleryFilter} value - The filter to activate.
   *
   * @returns {void} Nothing.
   */
  public setFilter(value: GalleryFilter): void {
    this.filter.set(value);
  }

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
        await this.feedback.toast('Photo enregistrée', 'success');
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
   * Toggles the liked state of a photo from its grid tile.
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
    const photos: UserPhoto[] = [...this.visiblePhotos()];
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
   * Reverse-geocodes the place name of every located photo missing one. Failures
   * are swallowed so a missing Mapbox token simply leaves the fallback label.
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
  }
  //#endregion
}
