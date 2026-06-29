import { type AfterViewInit, Component, inject, type OnDestroy } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { FeedbackService } from '@core/feedback';
import { GeolocationService } from '@core/geolocation';
import type { Coordinates } from '@core/geolocation';
import { PermissionsService } from '@core/permissions';
import { MapService } from '@features/map/services/map/map.service';
import { ClusterModalComponent } from '@features/map/ui/components';
import { PHOTO_LIBRARY, PhotoDetailComponent } from '@features/photos';
import type { PhotoLibrary, UserPhoto } from '@features/photos';

/**
 * Component MapPageComponent
 * @class MapPageComponent
 *
 * @description
 * Map tab page: fetches the position (default fallback on refusal — challenge 5),
 * initializes Mapbox and plots photos as pins/clusters (challenge 3). Orchestrates
 * through the {@link PHOTO_LIBRARY} port and the {@link MapService}.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-map',
  templateUrl: 'map-page.component.html',
  styleUrls: ['map-page.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner],
})
export class MapPageComponent implements AfterViewInit, OnDestroy {
  //#region Properties
  /**
   * Property mapService
   * @readonly
   *
   * @description
   * Map rendering service (route-scoped).
   *
   * @access private
   * @since 1.0.0
   *
   * @type {MapService}
   */
  private readonly mapService: MapService = inject<MapService>(MapService);

  /**
   * Property geolocation
   * @readonly
   *
   * @description
   * Geolocation wrapper.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {GeolocationService}
   */
  private readonly geolocation: GeolocationService = inject<GeolocationService>(GeolocationService);

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
   * Property library
   * @readonly
   *
   * @description
   * Photo library port.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {PhotoLibrary}
   */
  private readonly library: PhotoLibrary = inject<PhotoLibrary>(PHOTO_LIBRARY);

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
   * Ionic modal controller.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {ModalController}
   */
  private readonly modalController: ModalController = inject<ModalController>(ModalController);

  /**
   * Property mapLoaded
   *
   * @description
   * Whether the map has finished its initial load (hides the spinner).
   *
   * @access protected
   * @since 1.0.0
   *
   * @type {boolean}
   */
  protected mapLoaded = false;
  //#endregion

  //#region Lifecycle
  /**
   * Method ngAfterViewInit
   * @method ngAfterViewInit
   *
   * @description
   * Loads photos, resolves the position (with default fallback), initializes the
   * map and plots the photos.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<void>} Resolves once the map is ready.
   */
  public async ngAfterViewInit(): Promise<void> {
    await this.library.loadSaved();

    // Challenge 5: a denied geolocation must NOT block the map → default center.
    const granted: boolean = await this.permissions.ensureLocation();
    const coords: Coordinates | null = granted ? await this.geolocation.getCurrentPosition() : null;
    if (!coords) {
      await this.feedback.toast('Position indisponible : carte centrée par défaut', 'warning');
    }

    this.mapService.onPhotoOpen = (id: string): void => void this.openPhoto(id);
    this.mapService.onClusterOpen = (photos: UserPhoto[]): void => void this.openCluster(photos);

    try {
      await this.mapService.initMap('map', coords ? [coords.lng, coords.lat] : null);
      this.mapService.renderPhotos(this.library.photos());
    } catch {
      await this.feedback.alert(
        'Carte indisponible',
        'Vérifiez votre token Mapbox dans src/environments/environment.ts.',
      );
    } finally {
      this.mapLoaded = true;
    }
  }

  /**
   * Method ngOnDestroy
   * @method ngOnDestroy
   *
   * @description
   * Tears down the map instance.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public ngOnDestroy(): void {
    this.mapService.destroy();
  }
  //#endregion

  //#region Private Methods
  /**
   * Method openPhoto
   * @method openPhoto
   *
   * @description
   * Opens the full-screen detail view at the given photo.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {string} id - The id of the photo to open.
   *
   * @returns {Promise<void>} Resolves once the modal is presented.
   */
  private async openPhoto(id: string): Promise<void> {
    const photos: UserPhoto[] = [...this.library.photos()];
    const startIndex: number = photos.findIndex((photo: UserPhoto) => photo.id === id);
    if (startIndex < 0) return;

    const modal: HTMLIonModalElement = await this.modalController.create({
      component: PhotoDetailComponent,
      componentProps: { photos, startIndex },
    });
    await modal.present();
  }

  /**
   * Method openCluster
   * @method openCluster
   *
   * @description
   * Opens the place list modal, then the chosen photo if any.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {UserPhoto[]} photos - The photos of the clicked place.
   *
   * @returns {Promise<void>} Resolves once the flow completes.
   */
  private async openCluster(photos: UserPhoto[]): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: ClusterModalComponent,
      componentProps: { photos },
    });
    await modal.present();

    const result = await modal.onDidDismiss<{ openId?: string }>();
    const openId: string | undefined = result.data?.openId;
    if (openId) await this.openPhoto(openId);
  }
  //#endregion
}
