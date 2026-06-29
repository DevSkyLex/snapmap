import { Component, inject, type OnInit } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, cameraOutline, heart, imagesOutline, location } from 'ionicons/icons';
import { FeedbackService } from '@core/feedback';
import { PermissionsService } from '@core/permissions';
import { PHOTO_LIBRARY, PhotoDetailComponent } from '@features/photos';
import type { PhotoLibrary, UserPhoto } from '@features/photos';
import { SkeletonCardComponent } from '@shared/components';

/**
 * Component GalleryPageComponent
 * @class GalleryPageComponent
 *
 * @description
 * Gallery tab page: photo capture and an Instagram-style square grid (challenge 4
 * skeleton while capturing). Tapping a photo opens the full-screen detail view
 * (challenge 2), where like (challenge 1) and confirmed deletion (challenge 1)
 * live. Orchestrates through the {@link PHOTO_LIBRARY} port.
 *
 * @version 2.0.0
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
    IonButtons,
    IonContent,
    IonIcon,
    IonButton,
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
    addIcons({ camera, cameraOutline, heart, imagesOutline, location });
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
      if (photo) await this.feedback.toast('Photo ajoutée 📸', 'success');
    } catch {
      // Capture cancelled by the user: nothing to do.
    }
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
}
