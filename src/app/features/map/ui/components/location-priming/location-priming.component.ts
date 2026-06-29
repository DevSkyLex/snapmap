import { Component, inject } from '@angular/core';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircleOutline, location } from 'ionicons/icons';

/**
 * Component LocationPrimingComponent
 * @class LocationPrimingComponent
 *
 * @description
 * Internal widget of the "map" feature: a friendly priming sheet shown before the
 * native location prompt (challenge 5). Explains why SnapMap wants the position
 * and reassures that refusing keeps the map usable. Dismissed with
 * `{ allow: boolean }` — `true` for "Autoriser", `false` for "Plus tard".
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-location-priming',
  templateUrl: 'location-priming.component.html',
  styleUrls: ['location-priming.component.scss'],
  imports: [IonContent, IonIcon],
})
export class LocationPrimingComponent {
  //#region Properties
  /**
   * Property modalController
   * @readonly
   *
   * @description
   * Ionic modal controller (dismiss).
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
    addIcons({ informationCircleOutline, location });
  }
  //#endregion

  //#region Public Methods
  /**
   * Method allow
   * @method allow
   *
   * @description
   * Closes the sheet accepting the location request.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public allow(): void {
    void this.modalController.dismiss({ allow: true });
  }

  /**
   * Method later
   * @method later
   *
   * @description
   * Closes the sheet declining (the map falls back to a default center).
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public later(): void {
    void this.modalController.dismiss({ allow: false });
  }
  //#endregion
}
