import {
  type AfterViewInit,
  Component,
  type ElementRef,
  inject,
  Input,
  type OnDestroy,
  signal,
  viewChild,
  type WritableSignal,
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import type {
  PaymentRequest,
  PaymentRequestPaymentMethodEvent,
  Stripe,
  StripeCardCvcElement,
  StripeCardExpiryElement,
  StripeCardNumberElement,
  StripeElements,
  StripePaymentRequestButtonElement,
} from '@stripe/stripe-js';
import { addIcons } from 'ionicons';
import { lockClosed } from 'ionicons/icons';
import { PaymentApiService } from '@features/shop/data-access';
import { PaymentService } from '@features/shop/services/payment/payment.service';

/**
 * Type SheetStatus
 * @typedef {('loading' | 'ready' | 'paying' | 'error')} SheetStatus
 *
 * @description
 * Lifecycle state of the payment sheet.
 *
 * @since 2.0.0
 */
type SheetStatus = 'loading' | 'ready' | 'paying' | 'error';

/**
 * Component PaymentSheetComponent
 * @class PaymentSheetComponent
 *
 * @description
 * Widget of the "shop" feature: SnapMap's on-brand payment drawer. Mounts Stripe's
 * **split card fields** (`cardNumber` / `cardExpiry` / `cardCvc`) inside our own
 * styled field box so the colours match the app exactly, then confirms the
 * purchase. Dismisses with `{ paid: boolean }`.
 *
 * @version 2.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-payment-sheet',
  templateUrl: 'payment-sheet.component.html',
  styleUrls: ['payment-sheet.component.scss'],
  // Self-provided so the sheet works when presented at the app-root overlay
  // (outside the shop route's injector).
  providers: [PaymentApiService, PaymentService],
  imports: [IonContent, IonIcon],
})
export class PaymentSheetComponent implements AfterViewInit, OnDestroy {
  //#region Inputs
  /**
   * Property imageUrl
   *
   * @description
   * Thumbnail of the photo being unlocked.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {string}
   */
  @Input() public imageUrl = '';

  /**
   * Property title
   *
   * @description
   * The sheet's title line.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {string}
   */
  @Input() public title = 'Débloquer la photo';

  /**
   * Property subtitle
   *
   * @description
   * The sheet's subtitle line.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {string}
   */
  @Input() public subtitle = 'SnapMap';

  /**
   * Property amount
   *
   * @description
   * The display amount (e.g. `5,00 €`).
   *
   * @access public
   * @since 1.0.0
   *
   * @type {string}
   */
  @Input() public amount = '5,00 €';

  /**
   * Property amountCents
   *
   * @description
   * The amount in cents, shown in the wallet (Google Pay / Apple Pay) sheet.
   *
   * @access public
   * @since 3.0.0
   *
   * @type {number}
   */
  @Input() public amountCents = 500;
  //#endregion

  //#region Properties
  /**
   * Property numberHost
   * @readonly
   *
   * @description
   * Host node for the card-number field.
   *
   * @access private
   * @since 2.0.0
   */
  private readonly numberHost = viewChild.required<ElementRef<HTMLElement>>('numberHost');

  /**
   * Property expiryHost
   * @readonly
   *
   * @description
   * Host node for the expiry field.
   *
   * @access private
   * @since 2.0.0
   */
  private readonly expiryHost = viewChild.required<ElementRef<HTMLElement>>('expiryHost');

  /**
   * Property cvcHost
   * @readonly
   *
   * @description
   * Host node for the CVC field.
   *
   * @access private
   * @since 2.0.0
   */
  private readonly cvcHost = viewChild.required<ElementRef<HTMLElement>>('cvcHost');

  /**
   * Property prHost
   * @readonly
   *
   * @description
   * Host node for the Google Pay / Apple Pay (Payment Request) button.
   *
   * @access private
   * @since 3.0.0
   */
  private readonly prHost = viewChild.required<ElementRef<HTMLElement>>('prHost');

  /**
   * Property status
   * @readonly
   *
   * @description
   * Current sheet state (drives the spinner / button / error UI).
   *
   * @access protected
   * @since 1.0.0
   *
   * @type {WritableSignal<SheetStatus>}
   */
  protected readonly status: WritableSignal<SheetStatus> = signal<SheetStatus>('loading');

  /**
   * Property focused
   * @readonly
   *
   * @description
   * Whether any card field is focused (drives the box's teal highlight).
   *
   * @access protected
   * @since 2.0.0
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly focused: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Property walletAvailable
   * @readonly
   *
   * @description
   * Whether a wallet (Google Pay / Apple Pay / Link) is available on this device —
   * drives the "ou" divider and the wallet button visibility.
   *
   * @access protected
   * @since 3.0.0
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly walletAvailable: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Property nativeWallet
   * @readonly
   *
   * @description
   * Whether **native** Google Pay (Capacitor plugin) is available — drives the
   * dedicated Google Pay button shown on device. Mutually exclusive with
   * {@link PaymentSheetComponent.walletAvailable} (the web Payment Request button).
   *
   * @access protected
   * @since 4.0.0
   *
   * @type {WritableSignal<boolean>}
   */
  protected readonly nativeWallet: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Property errorMessage
   * @readonly
   *
   * @description
   * The current error message, if any.
   *
   * @access protected
   * @since 1.0.0
   *
   * @type {WritableSignal<string | null>}
   */
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property postalCode
   *
   * @description
   * The billing postal code typed by the user.
   *
   * @access protected
   * @since 2.0.0
   *
   * @type {string}
   */
  protected postalCode = '';

  /**
   * Property payment
   * @readonly
   *
   * @description
   * Stripe orchestration service.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {PaymentService}
   */
  private readonly payment: PaymentService = inject<PaymentService>(PaymentService);

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

  /**
   * Property stripe
   *
   * @description
   * The loaded Stripe instance.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {Stripe | undefined}
   */
  private stripe: Stripe | undefined;

  /**
   * Property clientSecret
   *
   * @description
   * The PaymentIntent client secret.
   *
   * @access private
   * @since 2.0.0
   *
   * @type {string | undefined}
   */
  private clientSecret: string | undefined;

  /**
   * Property cardNumber
   *
   * @description
   * The mounted card-number element (used to confirm).
   *
   * @access private
   * @since 2.0.0
   *
   * @type {StripeCardNumberElement | undefined}
   */
  private cardNumber: StripeCardNumberElement | undefined;

  /**
   * Property cardExpiry
   *
   * @description
   * The mounted expiry element.
   *
   * @access private
   * @since 2.0.0
   *
   * @type {StripeCardExpiryElement | undefined}
   */
  private cardExpiry: StripeCardExpiryElement | undefined;

  /**
   * Property cardCvc
   *
   * @description
   * The mounted CVC element.
   *
   * @access private
   * @since 2.0.0
   *
   * @type {StripeCardCvcElement | undefined}
   */
  private cardCvc: StripeCardCvcElement | undefined;

  /**
   * Property walletButton
   *
   * @description
   * The mounted Payment Request (Google Pay / Apple Pay) button, when available.
   *
   * @access private
   * @since 3.0.0
   *
   * @type {StripePaymentRequestButtonElement | undefined}
   */
  private walletButton: StripePaymentRequestButtonElement | undefined;
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
    addIcons({ lockClosed });
  }
  //#endregion

  //#region Lifecycle
  /**
   * Method ngAfterViewInit
   * @method ngAfterViewInit
   *
   * @description
   * Prepares the PaymentIntent, creates and mounts the split card fields, wires
   * focus highlighting and flips to `ready`.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<void>} Resolves once the fields are mounted (or errored).
   */
  public async ngAfterViewInit(): Promise<void> {
    try {
      const { stripe, elements, clientSecret } = await this.payment.prepare();
      this.stripe = stripe;
      this.clientSecret = clientSecret;

      const style = this.payment.fieldStyle();
      this.cardNumber = elements.create('cardNumber', {
        style,
        showIcon: true,
        placeholder: '1234 1234 1234 1234',
      });
      this.cardExpiry = elements.create('cardExpiry', { style });
      this.cardCvc = elements.create('cardCvc', { style });

      this.cardNumber.mount(this.numberHost().nativeElement);
      this.cardExpiry.mount(this.expiryHost().nativeElement);
      this.cardCvc.mount(this.cvcHost().nativeElement);

      const onFocus = (): void => this.focused.set(true);
      const onBlur = (): void => this.focused.set(false);
      this.cardNumber.on('focus', onFocus).on('blur', onBlur);
      this.cardExpiry.on('focus', onFocus).on('blur', onBlur);
      this.cardCvc.on('focus', onFocus).on('blur', onBlur);
      this.cardNumber.on('ready', () => this.status.set('ready'));

      // Wallet : Google Pay natif sur appareil (le bouton web Payment Request ne
      // fonctionne pas dans une WebView Android), Payment Request Stripe.js sur le web.
      if (Capacitor.isNativePlatform()) {
        void this.setupNativeWallet();
      } else {
        void this.setupWallet(stripe, elements, clientSecret);
      }
    } catch {
      this.fail('Paiement indisponible. Le backend Stripe est-il lancé ?');
    }
  }

  /**
   * Method ngOnDestroy
   * @method ngOnDestroy
   *
   * @description
   * Tears down the card fields.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public ngOnDestroy(): void {
    this.cardNumber?.destroy();
    this.cardExpiry?.destroy();
    this.cardCvc?.destroy();
    this.walletButton?.destroy();
  }
  //#endregion

  //#region Public Methods
  /**
   * Method onPostal
   * @method onPostal
   *
   * @description
   * Tracks the billing postal code input.
   *
   * @access public
   * @since 2.0.0
   *
   * @param {Event} event - The input event.
   *
   * @returns {void} Nothing.
   */
  public onPostal(event: Event): void {
    this.postalCode = (event.target as HTMLInputElement).value;
  }

  /**
   * Method pay
   * @method pay
   *
   * @description
   * Confirms the card payment and dismisses on success, or surfaces the error.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<void>} Resolves once the attempt settles.
   */
  public async pay(): Promise<void> {
    if (!this.stripe || !this.clientSecret || !this.cardNumber || this.status() !== 'ready') return;

    this.status.set('paying');
    this.errorMessage.set(null);

    const outcome = await this.payment.confirm(
      this.stripe,
      this.clientSecret,
      this.cardNumber,
      this.postalCode.trim() || undefined,
    );

    if (outcome.ok) {
      await this.modalController.dismiss({ paid: true });
      return;
    }

    this.errorMessage.set(outcome.message ?? 'Paiement non abouti. Vérifiez votre carte.');
    this.status.set('ready');
  }

  /**
   * Method payWithGoogle
   * @method payWithGoogle
   *
   * @description
   * Presents the **native** Google Pay sheet and dismisses on success.
   *
   * @access public
   * @since 4.0.0
   *
   * @returns {Promise<void>} Resolves once the attempt settles.
   */
  public async payWithGoogle(): Promise<void> {
    if (!this.clientSecret || this.status() === 'paying') return;

    this.status.set('paying');
    this.errorMessage.set(null);

    const outcome = await this.payment.payWithGooglePay(this.clientSecret);
    if (outcome.ok) {
      await this.modalController.dismiss({ paid: true });
      return;
    }

    if (outcome.message) this.errorMessage.set(outcome.message);
    this.status.set('ready');
  }

  /**
   * Method dismiss
   * @method dismiss
   *
   * @description
   * Closes the sheet without paying.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public dismiss(): void {
    void this.modalController.dismiss({ paid: false });
  }
  //#endregion

  //#region Private Methods
  /**
   * Method fail
   * @method fail
   *
   * @description
   * Switches to the error state with a message.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {string} message - The error to display.
   *
   * @returns {void} Nothing.
   */
  private fail(message: string): void {
    this.errorMessage.set(message);
    this.status.set('error');
  }

  /**
   * Method setupNativeWallet
   * @method setupNativeWallet
   *
   * @description
   * Reveals the native Google Pay button when the device supports it (Capacitor
   * plugin, Android).
   *
   * @access private
   * @since 4.0.0
   *
   * @returns {Promise<void>} Resolves once availability is known.
   */
  private async setupNativeWallet(): Promise<void> {
    if (await this.payment.isGooglePayReady()) this.nativeWallet.set(true);
  }

  /**
   * Method setupWallet
   * @method setupWallet
   *
   * @description
   * Wires the Payment Request (Google Pay / Apple Pay / Link) flow and mounts its
   * button — only when a wallet is actually available on the device.
   *
   * @access private
   * @since 3.0.0
   *
   * @param {Stripe} stripe - The Stripe instance.
   * @param {StripeElements} elements - The Elements group.
   * @param {string} clientSecret - The PaymentIntent client secret.
   *
   * @returns {Promise<void>} Resolves once the button is mounted (or skipped).
   */
  private async setupWallet(
    stripe: Stripe,
    elements: StripeElements,
    clientSecret: string,
  ): Promise<void> {
    const paymentRequest: PaymentRequest = stripe.paymentRequest({
      country: 'FR',
      currency: 'eur',
      total: { label: this.title, amount: this.amountCents },
      requestPayerName: false,
      requestPayerEmail: false,
    });

    const available = await paymentRequest.canMakePayment();
    if (!available) return; // Pas de Google Pay / Apple Pay / Link sur cet appareil.

    paymentRequest.on('paymentmethod', (event: PaymentRequestPaymentMethodEvent) => {
      void this.payWithWallet(stripe, clientSecret, event);
    });

    this.walletButton = elements.create('paymentRequestButton', {
      paymentRequest,
      style: { paymentRequestButton: { theme: 'dark', height: '52px' } },
    });
    this.walletButton.mount(this.prHost().nativeElement);
    this.walletAvailable.set(true);
  }

  /**
   * Method payWithWallet
   * @method payWithWallet
   *
   * @description
   * Confirms the payment from a wallet (Google Pay / Apple Pay) method, handling
   * any required action, then dismisses on success.
   *
   * @access private
   * @since 3.0.0
   *
   * @param {Stripe} stripe - The Stripe instance.
   * @param {string} clientSecret - The PaymentIntent client secret.
   * @param {PaymentRequestPaymentMethodEvent} event - The wallet payment-method event.
   *
   * @returns {Promise<void>} Resolves once the attempt settles.
   */
  private async payWithWallet(
    stripe: Stripe,
    clientSecret: string,
    event: PaymentRequestPaymentMethodEvent,
  ): Promise<void> {
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: event.paymentMethod.id },
      { handleActions: false },
    );

    if (error) {
      event.complete('fail');
      this.errorMessage.set(error.message ?? 'Paiement refusé.');
      return;
    }

    event.complete('success');

    if (paymentIntent?.status === 'requires_action') {
      const next = await stripe.confirmCardPayment(clientSecret);
      if (next.error) {
        this.errorMessage.set(next.error.message ?? 'Paiement non abouti.');
        return;
      }
    }

    await this.modalController.dismiss({ paid: true });
  }
  //#endregion
}
