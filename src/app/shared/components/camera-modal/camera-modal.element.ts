/**
 * Class PwaCameraModal
 * @class PwaCameraModal
 *
 * @description
 * `<pwa-camera-modal>` custom element required by `@capacitor/camera` 8 on the
 * web. Implements the exact contract expected by the plugin (see
 * `node_modules/@capacitor/camera/.../web.js`):
 *
 * - property `facingMode` (`'user' | 'environment'`)
 * - method `componentOnReady(): Promise<void>` (awaited before `present()`)
 * - method `present()` — opens the camera
 * - method `dismiss()` — closes and releases the stream
 * - event `onPhoto` whose `detail` is a `File` (captured), `null` (cancelled)
 *   or an `Error`.
 *
 * `@ionic/pwa-elements` is intentionally NOT used (incompatible with Camera 8).
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export class PwaCameraModal extends HTMLElement {
  //#region Properties
  /**
   * Property facingMode
   *
   * @description
   * The requested camera facing mode (set by the plugin before `present()`).
   *
   * @access public
   * @since 1.0.0
   *
   * @type {'user' | 'environment'}
   */
  public facingMode: 'user' | 'environment' = 'user';

  /**
   * Property stream
   *
   * @description
   * The active media stream, while the camera is open.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {MediaStream | undefined}
   */
  private stream: MediaStream | undefined;

  /**
   * Property videoEl
   *
   * @description
   * The live preview video element.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {HTMLVideoElement | undefined}
   */
  private videoEl: HTMLVideoElement | undefined;
  //#endregion

  //#region Public Methods
  /**
   * Method componentOnReady
   * @method componentOnReady
   *
   * @description
   * Resolves once the element is ready (immediately — it is already connected).
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<void>} Resolves immediately.
   */
  public componentOnReady(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Method present
   * @method present
   *
   * @description
   * Renders the camera UI and starts the webcam stream.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<void>} Resolves once the stream has started (or errored).
   */
  public async present(): Promise<void> {
    this.render();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facingMode },
        audio: false,
      });
      if (this.videoEl) {
        this.videoEl.srcObject = this.stream;
        await this.videoEl.play();
      }
    } catch (error) {
      this.emit(error instanceof Error ? error : new Error('Accès caméra impossible'));
    }
  }

  /**
   * Method dismiss
   * @method dismiss
   *
   * @description
   * Stops the stream and clears the UI.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public dismiss(): void {
    for (const track of this.stream?.getTracks() ?? []) track.stop();
    this.stream = undefined;
    this.innerHTML = '';
  }
  //#endregion

  //#region Private Methods
  /**
   * Method capture
   * @method capture
   *
   * @description
   * Draws the current video frame to a canvas and emits it as a JPEG `File`.
   *
   * @access private
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  private capture(): void {
    if (!this.videoEl || !this.videoEl.videoWidth) {
      this.emit(null);
      return;
    }

    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = this.videoEl.videoWidth;
    canvas.height = this.videoEl.videoHeight;

    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!context) {
      this.emit(null);
      return;
    }

    // Mirror selfies (front camera).
    if (this.facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob: Blob | null) => {
        if (!blob) {
          this.emit(null);
          return;
        }
        this.emit(new File([blob], `photo-${Date.now()}.jpeg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.95,
    );
  }

  /**
   * Method emit
   * @method emit
   *
   * @description
   * Dispatches the `onPhoto` event the plugin listens to.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {File | Error | null} detail - The captured file, an error, or `null`.
   *
   * @returns {void} Nothing.
   */
  private emit(detail: File | Error | null): void {
    this.dispatchEvent(new CustomEvent('onPhoto', { detail }));
  }

  /**
   * Method render
   * @method render
   *
   * @description
   * Builds the full-screen camera UI and wires the shutter/cancel controls.
   *
   * @access private
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  private render(): void {
    const mirror: string = this.facingMode === 'user' ? 'scaleX(-1)' : 'none';
    this.innerHTML = `
      <style>
        .pwa-cam { position: fixed; inset: 0; z-index: 99999; background: #000;
          display: flex; flex-direction: column; }
        .pwa-cam video { flex: 1; width: 100%; height: 100%; object-fit: cover;
          transform: ${mirror}; }
        .pwa-cam .bar { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px;
          display: flex; align-items: center; justify-content: center; gap: 48px; }
        .pwa-cam .shutter { width: 72px; height: 72px; border-radius: 50%;
          background: #fff; border: 5px solid rgba(255,255,255,.5); cursor: pointer; }
        .pwa-cam .cancel { position: absolute; top: 16px; right: 16px; color: #fff;
          font-size: 28px; background: rgba(0,0,0,.4); border: none; border-radius: 50%;
          width: 44px; height: 44px; cursor: pointer; }
      </style>
      <div class="pwa-cam">
        <video autoplay playsinline muted></video>
        <button class="cancel" aria-label="Fermer">&times;</button>
        <div class="bar"><button class="shutter" aria-label="Prendre la photo"></button></div>
      </div>`;

    this.videoEl = this.querySelector('video') as HTMLVideoElement;
    this.querySelector('.shutter')?.addEventListener('click', () => this.capture());
    this.querySelector('.cancel')?.addEventListener('click', () => this.emit(null));
  }
  //#endregion
}

if (!customElements.get('pwa-camera-modal')) {
  customElements.define('pwa-camera-modal', PwaCameraModal);
}
