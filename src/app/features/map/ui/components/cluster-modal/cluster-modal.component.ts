import { Component, inject, Input } from '@angular/core';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, location } from 'ionicons/icons';
import type { UserPhoto } from '@features/photos/models';

/**
 * Component ClusterModalComponent
 * @class ClusterModalComponent
 *
 * @description
 * Internal widget of the "map" feature (challenge 3): a **sheet modal** listing
 * the photos of a single place (a busy cluster). Headed by the app's geo-tag
 * vocabulary (coral pin + place + GPS coordinates). Tapping a photo dismisses
 * the modal with the id to open.
 *
 * @version 2.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-cluster-modal',
  templateUrl: 'cluster-modal.component.html',
  styleUrls: ['cluster-modal.component.scss'],
  imports: [IonContent, IonIcon],
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

  //#region Accessors
  /**
   * Property place
   * @readonly
   *
   * @description
   * The cluster's place label (the first photo's resolved name, with fallback).
   *
   * @access protected
   * @since 2.0.0
   *
   * @type {string}
   */
  protected get place(): string {
    return this.photos[0]?.locationName ?? 'Ce lieu';
  }
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
    addIcons({ close, location });
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
