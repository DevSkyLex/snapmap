import { Component, inject, type OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  IonButton,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, heart, heartOutline, trash } from 'ionicons/icons';
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
 * Gallery tab page: photo capture, grid, like (challenge 1), confirmed deletion
 * (challenge 1), skeleton card (challenge 4) and opening of the detail view
 * (challenge 2). Orchestrates through the {@link PHOTO_LIBRARY} port.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-gallery',
  templateUrl: 'gallery-page.component.html',
  styleUrls: ['gallery-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
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
    addIcons({ camera, heart, heartOutline, trash });
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
   * Method toggleLike
   * @method toggleLike
   *
   * @description
   * Toggles the liked state of a photo (without opening the detail view).
   *
   * @access public
   * @since 1.0.0
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
   * Method confirmDelete
   * @method confirmDelete
   *
   * @description
   * Asks for confirmation, then deletes the photo (challenge 1).
   *
   * @access public
   * @since 1.0.0
   *
   * @param {UserPhoto} photo - The photo to delete.
   * @param {Event} event - The originating click event.
   *
   * @returns {Promise<void>} Resolves once the deletion flow completes.
   */
  public async confirmDelete(photo: UserPhoto, event: Event): Promise<void> {
    event.stopPropagation();
    const confirmed: boolean = await this.feedback.confirm(
      'Supprimer la photo ?',
      'Cette action est définitive.',
      'Supprimer',
    );
    if (confirmed) {
      await this.library.deletePhoto(photo);
      await this.feedback.toast('Photo supprimée', 'medium');
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
