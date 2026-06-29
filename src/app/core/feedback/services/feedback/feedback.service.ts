import { inject, Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular/standalone';

/**
 * Type ToastColor
 * @typedef {('success' | 'danger' | 'warning' | 'medium' | 'primary')} ToastColor
 *
 * @description
 * Allowed Ionic colors for feedback toasts.
 *
 * @since 1.0.0
 */
export type ToastColor = 'success' | 'danger' | 'warning' | 'medium' | 'primary';

/**
 * Service FeedbackService
 * @class FeedbackService
 *
 * @description
 * App-wide infrastructure concern (challenge 4): single entry point for user
 * feedback — toasts, alerts, confirmation dialogs and loaders. Provisioned via
 * {@link provideFeedback}, never with `providedIn: 'root'`.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Injectable()
export class FeedbackService {
  //#region Properties
  /**
   * Property toastController
   * @readonly
   *
   * @description
   * Ionic controller used to create toasts.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {ToastController}
   */
  private readonly toastController: ToastController = inject<ToastController>(ToastController);

  /**
   * Property alertController
   * @readonly
   *
   * @description
   * Ionic controller used to create alerts and confirmation dialogs.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {AlertController}
   */
  private readonly alertController: AlertController = inject<AlertController>(AlertController);

  /**
   * Property loadingController
   * @readonly
   *
   * @description
   * Ionic controller used to create loaders.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {LoadingController}
   */
  private readonly loadingController: LoadingController =
    inject<LoadingController>(LoadingController);

  /**
   * Property loading
   *
   * @description
   * The currently presented loader, if any.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {HTMLIonLoadingElement | undefined}
   */
  private loading: HTMLIonLoadingElement | undefined;
  //#endregion

  //#region Methods
  /**
   * Method toast
   * @method toast
   *
   * @description
   * Presents a transient toast at the top of the screen.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {string} message - The message to display.
   * @param {ToastColor} [color] - The toast color (defaults to `'medium'`).
   * @param {number} [duration] - The duration in milliseconds (defaults to `2200`).
   *
   * @returns {Promise<void>} Resolves once the toast is presented.
   */
  public async toast(
    message: string,
    color: ToastColor = 'medium',
    duration = 2200,
  ): Promise<void> {
    const toast: HTMLIonToastElement = await this.toastController.create({
      message,
      color,
      duration,
      position: 'top',
    });
    await toast.present();
  }

  /**
   * Method confirm
   * @method confirm
   *
   * @description
   * Presents a confirmation dialog (e.g. deletion) and resolves the user's choice.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {string} header - The dialog header.
   * @param {string} message - The dialog message.
   * @param {string} [confirmText] - The confirm button label (defaults to `'Confirmer'`).
   *
   * @returns {Promise<boolean>} `true` when the user confirms.
   */
  public async confirm(
    header: string,
    message: string,
    confirmText = 'Confirmer',
  ): Promise<boolean> {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header,
      message,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: confirmText, role: 'confirm' },
      ],
    });
    await alert.present();

    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  /**
   * Method alert
   * @method alert
   *
   * @description
   * Presents a simple informational alert with a single dismiss button.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {string} header - The alert header.
   * @param {string} message - The alert message.
   *
   * @returns {Promise<void>} Resolves once the alert is presented.
   */
  public async alert(header: string, message: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * Method showLoading
   * @method showLoading
   *
   * @description
   * Presents a blocking loader.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {string} [message] - The loader message (defaults to `'Chargement…'`).
   *
   * @returns {Promise<void>} Resolves once the loader is presented.
   */
  public async showLoading(message = 'Chargement…'): Promise<void> {
    this.loading = await this.loadingController.create({ message, spinner: 'crescent' });
    await this.loading.present();
  }

  /**
   * Method hideLoading
   * @method hideLoading
   *
   * @description
   * Dismisses the current loader, if any.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<void>} Resolves once the loader is dismissed.
   */
  public async hideLoading(): Promise<void> {
    await this.loading?.dismiss();
    this.loading = undefined;
  }
  //#endregion
}
