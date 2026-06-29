import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Input,
  type OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendar, close, heart, heartOutline, location } from 'ionicons/icons';
import { GeocodingService } from '@core/geocoding';
import type { UserPhoto } from '@features/photos/models';
import { PHOTO_LIBRARY } from '@features/photos/ports/photo-library';
import type { PhotoLibrary } from '@features/photos/ports/photo-library';

/**
 * Component PhotoDetailComponent
 * @class PhotoDetailComponent
 *
 * @description
 * Widget of the "photos" feature (challenge 2): full-screen detail view — swipe
 * carousel across photos, capture date and real place name (reverse geocoding).
 * Consumes the {@link PHOTO_LIBRARY} port, never the concrete service.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-photo-detail',
  templateUrl: 'photo-detail.component.html',
  styleUrls: ['photo-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonFooter,
    DatePipe,
  ],
})
export class PhotoDetailComponent implements OnInit {
  //#region Inputs
  /**
   * Property photos
   *
   * @description
   * The photos to browse in the carousel.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {UserPhoto[]}
   */
  @Input() public photos: UserPhoto[] = [];

  /**
   * Property startIndex
   *
   * @description
   * The index of the photo to show first.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {number}
   */
  @Input() public startIndex = 0;
  //#endregion

  //#region Properties
  /**
   * Property track
   *
   * @description
   * Reference to the scrollable carousel track element.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {ElementRef<HTMLDivElement> | undefined}
   */
  @ViewChild('track') private track?: ElementRef<HTMLDivElement>;

  /**
   * Property current
   *
   * @description
   * Index of the currently centered photo.
   *
   * @access protected
   * @since 1.0.0
   *
   * @type {number}
   */
  protected current = 0;

  /**
   * Property geocoding
   * @readonly
   *
   * @description
   * Reverse geocoding service.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {GeocodingService}
   */
  private readonly geocoding: GeocodingService = inject<GeocodingService>(GeocodingService);

  /**
   * Property library
   * @readonly
   *
   * @description
   * Photo library port (used to toggle likes).
   *
   * @access private
   * @since 1.0.0
   *
   * @type {PhotoLibrary}
   */
  private readonly library: PhotoLibrary = inject<PhotoLibrary>(PHOTO_LIBRARY);

  /**
   * Property modalController
   * @readonly
   *
   * @description
   * Ionic modal controller (used to dismiss this view).
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
    addIcons({ close, heart, heartOutline, location, calendar });
  }
  //#endregion

  //#region Lifecycle
  /**
   * Method ngOnInit
   * @method ngOnInit
   *
   * @description
   * Initializes the carousel position and lazily resolves place names.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public ngOnInit(): void {
    this.current = this.startIndex;
    for (const photo of this.photos) void this.ensureLocation(photo);
    globalThis.setTimeout(() => this.scrollTo(this.startIndex), 60);
  }
  //#endregion

  //#region Accessors
  /**
   * Accessor photo
   *
   * @description
   * The currently centered photo.
   *
   * @access protected
   * @since 1.0.0
   *
   * @returns {UserPhoto} The centered photo.
   */
  protected get photo(): UserPhoto {
    return this.photos[this.current] as UserPhoto;
  }
  //#endregion

  //#region Public Methods
  /**
   * Method onScroll
   * @method onScroll
   *
   * @description
   * Updates {@link PhotoDetailComponent.current} from the carousel scroll offset.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public onScroll(): void {
    const element: HTMLDivElement | undefined = this.track?.nativeElement;
    if (!element) return;

    const index: number = Math.round(element.scrollLeft / element.clientWidth);
    if (index !== this.current && index >= 0 && index < this.photos.length) {
      this.current = index;
    }
  }

  /**
   * Method toggleLike
   * @method toggleLike
   *
   * @description
   * Toggles the liked state of the current photo.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public toggleLike(): void {
    void this.library.toggleLike(this.photo);
  }

  /**
   * Method dismiss
   * @method dismiss
   *
   * @description
   * Closes the detail modal.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public dismiss(): void {
    void this.modalController.dismiss();
  }
  //#endregion

  //#region Private Methods
  /**
   * Method scrollTo
   * @method scrollTo
   *
   * @description
   * Scrolls the carousel to the given photo index.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {number} index - The target photo index.
   *
   * @returns {void} Nothing.
   */
  private scrollTo(index: number): void {
    const element: HTMLDivElement | undefined = this.track?.nativeElement;
    if (element) element.scrollTo({ left: index * element.clientWidth, behavior: 'auto' });
  }

  /**
   * Method ensureLocation
   * @method ensureLocation
   *
   * @description
   * Resolves and caches the place name of a photo when missing.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {UserPhoto} photo - The photo to resolve.
   *
   * @returns {Promise<void>} Resolves once the place name is set (or skipped).
   */
  private async ensureLocation(photo: UserPhoto): Promise<void> {
    if (photo.locationName || photo.lat === null || photo.lng === null) return;
    photo.locationName = await this.geocoding.reverseGeocode(photo.lng, photo.lat);
  }
  //#endregion
}
