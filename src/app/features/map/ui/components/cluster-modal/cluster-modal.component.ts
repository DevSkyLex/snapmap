import { Component, inject, Input } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import type { UserPhoto } from '@features/photos/models';

/**
 * Component ClusterModalComponent
 * @class ClusterModalComponent
 *
 * @description
 * Internal widget of the "map" feature (challenge 3): full-screen modal listing
 * the photos of a single place (a cluster with many photos). Tapping a photo
 * dismisses the modal with the id to open.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-cluster-modal',
  templateUrl: 'cluster-modal.component.html',
  styleUrls: ['cluster-modal.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class ClusterModalComponent {
  //#region Inputs
  /**
   * Property photos
   *
   * @description
   * The photos located at the clicked place.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {UserPhoto[]}
   */
  @Input() public photos: UserPhoto[] = [];
  //#endregion

  //#region Properties
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
    addIcons({ close });
  }
  //#endregion

  //#region Public Methods
  /**
   * Method open
   * @method open
   *
   * @description
   * Dismisses the modal, returning the id of the photo to open.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {UserPhoto} photo - The selected photo.
   *
   * @returns {void} Nothing.
   */
  public open(photo: UserPhoto): void {
    void this.modalController.dismiss({ openId: photo.id });
  }

  /**
   * Method dismiss
   * @method dismiss
   *
   * @description
   * Closes the modal without selecting a photo.
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
}
