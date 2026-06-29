import { Component, inject, Input } from '@angular/core';
import { IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';

/**
 * Component ConfirmDialogComponent
 * @class ConfirmDialogComponent
 *
 * @description
 * Reusable on-brand confirmation dialog (centered card): an icon badge, a title,
 * a message and two stacked actions. Presented as an auto-height centered modal
 * (`dialog-modal` cssClass) and dismissed with `{ confirmed: boolean }`. Used for
 * destructive confirmations such as photo deletion.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: 'confirm-dialog.component.html',
  styleUrls: ['confirm-dialog.component.scss'],
  imports: [IonIcon],
})
export class ConfirmDialogComponent {
  //#region Inputs
  /**
   * Property title
   *
   * @description
   * The dialog title.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {string}
   */
  @Input() public title = 'Confirmer ?';

  /**
   * Property message
   *
   * @description
   * The dialog body message.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {string}
   */
  @Input() public message = '';

  /**
   * Property confirmText
   *
   * @description
   * The confirm button label.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {string}
   */
  @Input() public confirmText = 'Confirmer';

  /**
   * Property cancelText
   *
   * @description
   * The cancel button label.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {string}
   */
  @Input() public cancelText = 'Annuler';

  /**
   * Property icon
   *
   * @description
   * The ionicon name shown in the badge.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {string}
   */
  @Input() public icon = 'trash';

  /**
   * Property danger
   *
   * @description
   * Whether the confirm action is destructive (red badge + button).
   *
   * @access public
   * @since 1.0.0
   *
   * @type {boolean}
   */
  @Input() public danger = false;
  //#endregion

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
    addIcons({ trash });
  }
  //#endregion

  //#region Public Methods
  /**
   * Method confirm
   * @method confirm
   *
   * @description
   * Closes the dialog with a positive result.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public confirm(): void {
    void this.modalController.dismiss({ confirmed: true });
  }

  /**
   * Method cancel
   * @method cancel
   *
   * @description
   * Closes the dialog with a negative result.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public cancel(): void {
    void this.modalController.dismiss({ confirmed: false });
  }
  //#endregion
}
