import {
  type AfterViewInit,
  Component,
  inject,
  type OnDestroy,
  signal,
  type WritableSignal,
} from '@angular/core';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locate, search } from 'ionicons/icons';
import { FeedbackService } from '@core/feedback';
import { GeocodingService } from '@core/geocoding';
import { GeolocationService } from '@core/geolocation';
import type { Coordinates } from '@core/geolocation';
import { PermissionsService } from '@core/permissions';
import { MapService } from '@features/map/services/map/map.service';
import { ClusterModalComponent, LocationPrimingComponent } from '@features/map/ui/components';
import { PHOTO_LIBRARY, PhotoDetailComponent } from '@features/photos';
import type { PhotoLibrary, UserPhoto } from '@features/photos';

/**
 * Variable locationPrimed
 *
 * @description
 * Whether the location priming sheet has already been shown this session (it
 * only appears once, before the first native prompt).
 *
 * @since 4.1.0
 */
let locationPrimed = false;

/**
 * Component MapPageComponent
 * @class MapPageComponent
 *
 * @description
 * Map tab page: fetches the position (default fallback on refusal — challenge 5),
 * initializes Mapbox and plots photos as circular pins/clusters (challenge 3).
 * A floating field searches a place (forward geocoding) and a control recenters on
 * the user. Orchestrates through the {@link PHOTO_LIBRARY} port and the
 * {@link MapService}.
 *
 * @version 4.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-map',
  templateUrl: 'map-page.component.html',
  styleUrls: ['map-page.component.scss'],
  imports: [IonContent, IonIcon],
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
   * Property geocoding
   * @readonly
   *
   * @description
   * Geocoding service (forward lookup for the search field).
   *
   * @access private
   * @since 4.0.0
   *
   * @type {GeocodingService}
   */
  private readonly geocoding: GeocodingService = inject<GeocodingService>(GeocodingService);

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
   * @readonly
   *
   * @description
   * Whether the map has finished its initial load (hides the spinner). Exposed as
   * a signal so the view reacts under zoneless change detection.
   *
   * @access protected
   * @since 1.0.0
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly mapLoaded: WritableSignal<boolean> = signal<boolean>(false);
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
   * @since 2.0.0
   */
  public constructor() {
    addIcons({ locate, search });
  }
  //#endregion

  //#region Lifecycle
  /**
   * Method ngAfterViewInit
   * @method ngAfterViewInit
   *
   * @description
   * Loads photos, resolves the position (with default fallback), initializes the
   * map, plots the photos and the "my position" marker.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<void>} Resolves once the map is ready.
   */
  public async ngAfterViewInit(): Promise<void> {
    await this.library.loadSaved();

    // Challenge 5: a denied geolocation must NOT block the map → default center.
    const coords: Coordinates | null = await this.resolveLocation();
    if (!coords) {
      await this.feedback.toast('Position indisponible : carte centrée par défaut', 'warning');
    }

    this.mapService.onPhotoOpen = (id: string): void => void this.openPhoto(id);
    this.mapService.onClusterOpen = (photos: UserPhoto[]): void => void this.openCluster(photos);

    try {
      await this.mapService.initMap('map', coords ? [coords.lng, coords.lat] : null);
      this.mapService.renderPhotos(this.library.photos());
      if (coords) this.mapService.setUserLocation([coords.lng, coords.lat]);
    } catch {
      await this.feedback.alert(
        'Carte indisponible',
        'Vérifiez votre token Mapbox dans src/environments/environment.ts.',
      );
    } finally {
      this.mapLoaded.set(true);
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

  //#region Public Methods
  /**
   * Method search
   * @method search
   *
   * @description
   * Forward-geocodes the typed place and flies the map there, or toasts when it
   * cannot be found.
   *
   * @access public
   * @since 4.0.0
   *
   * @param {string} query - The free-text place to search.
   *
   * @returns {Promise<void>} Resolves once the lookup settles.
   */
  public async search(query: string): Promise<void> {
    if (!query.trim()) return;

    const center: [number, number] | null = await this.geocoding.forwardGeocode(query);
    if (center) {
      this.mapService.focusOn(center, 13);
    } else {
      await this.feedback.toast('Lieu introuvable', 'medium');
    }
  }

  /**
   * Method recenter
   * @method recenter
   *
   * @description
   * Flies the map back to the user's position.
   *
   * @access public
   * @since 4.0.0
   *
   * @returns {void} Nothing.
   */
  public recenter(): void {
    this.mapService.recenter();
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
   * Method resolveLocation
   * @method resolveLocation
   *
   * @description
   * Resolves the user position, showing the priming sheet once per session before
   * the first native prompt. "Plus tard" skips geolocation (default center).
   *
   * @access private
   * @since 4.1.0
   *
   * @returns {Promise<Coordinates | null>} The position, or `null` for the default center.
   */
  private async resolveLocation(): Promise<Coordinates | null> {
    if (!locationPrimed) {
      locationPrimed = true;
      const allow: boolean = await this.showLocationPriming();
      if (!allow) return null;
    }

    const granted: boolean = await this.permissions.ensureLocation();
    return granted ? await this.geolocation.getCurrentPosition() : null;
  }

  /**
   * Method showLocationPriming
   * @method showLocationPriming
   *
   * @description
   * Presents the location priming sheet and resolves the user's choice.
   *
   * @access private
   * @since 4.1.0
   *
   * @returns {Promise<boolean>} `true` when the user accepts the location request.
   */
  private async showLocationPriming(): Promise<boolean> {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: LocationPrimingComponent,
      cssClass: 'sheet-modal',
      breakpoints: [0, 0.62],
      initialBreakpoint: 0.62,
      handle: true,
    });
    await modal.present();

    const result = await modal.onDidDismiss<{ allow?: boolean }>();
    return result.data?.allow ?? false;
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
      cssClass: 'sheet-modal',
      breakpoints: [0, 0.7, 1],
      initialBreakpoint: 0.7,
      handle: true,
    });
    await modal.present();

    const result = await modal.onDidDismiss<{ openId?: string }>();
    const openId: string | undefined = result.data?.openId;
    if (openId) await this.openPhoto(openId);
  }
  //#endregion
}
