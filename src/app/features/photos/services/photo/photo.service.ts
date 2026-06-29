import { inject, Injectable, type Signal, signal, type WritableSignal } from '@angular/core';
import { Camera, type MediaResult } from '@capacitor/camera';
import { GeolocationService } from '@core/geolocation';
import type { Coordinates } from '@core/geolocation';
import { buildDemoPhotos, PhotoStorageService } from '@features/photos/data-access';
import type { UserPhoto } from '@features/photos/models';
import type { PhotoLibrary } from '@features/photos/ports/photo-library';

/**
 * Service PhotoService
 * @class PhotoService
 *
 * @description
 * Orchestration service of the "photos" domain and concrete adapter of the
 * {@link PhotoLibrary} port. Composes the camera (Capacitor), geolocation and
 * the {@link PhotoStorageService}, and exposes state as read-only signals.
 *
 * Each mutation pushes a new array reference (signal notification) while keeping
 * the identity of the `UserPhoto` objects shared with the views.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Injectable()
export class PhotoService implements PhotoLibrary {
  //#region Properties
  /**
   * Property storage
   * @readonly
   *
   * @description
   * Persistence layer (disk + Preferences).
   *
   * @access private
   * @since 1.0.0
   *
   * @type {PhotoStorageService}
   */
  private readonly storage: PhotoStorageService = inject<PhotoStorageService>(PhotoStorageService);

  /**
   * Property geolocation
   * @readonly
   *
   * @description
   * Geolocation wrapper used to stamp each capture.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {GeolocationService}
   */
  private readonly geolocation: GeolocationService = inject<GeolocationService>(GeolocationService);

  /**
   * Property list
   *
   * @description
   * Mutable backing list preserving `UserPhoto` object identity.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {UserPhoto[]}
   */
  private list: UserPhoto[] = [];

  /**
   * Property loaded
   *
   * @description
   * Whether persisted photos have already been loaded once.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {boolean}
   */
  private loaded = false;

  /**
   * Property photosState
   * @readonly
   *
   * @description
   * Writable signal mirroring {@link PhotoService.list}.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {WritableSignal<ReadonlyArray<UserPhoto>>}
   */
  private readonly photosState: WritableSignal<ReadonlyArray<UserPhoto>> = signal<
    ReadonlyArray<UserPhoto>
  >([]);

  /**
   * Property capturingState
   * @readonly
   *
   * @description
   * Writable signal raised while a new photo is being saved.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly capturingState: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Property photos
   * @readonly
   *
   * @description
   * Read-only view of the photo collection.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {Signal<ReadonlyArray<UserPhoto>>}
   */
  public readonly photos: Signal<ReadonlyArray<UserPhoto>> = this.photosState.asReadonly();

  /**
   * Property isCapturing
   * @readonly
   *
   * @description
   * Read-only capturing flag (drives the skeleton card).
   *
   * @access public
   * @since 1.0.0
   *
   * @type {Signal<boolean>}
   */
  public readonly isCapturing: Signal<boolean> = this.capturingState.asReadonly();
  //#endregion

  //#region Public Methods
  /**
   * Method loadSaved
   * @method loadSaved
   *
   * @description
   * Loads persisted photos once (shared across tabs), unless `force` is set.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {boolean} [force] - Reload even if already loaded.
   *
   * @returns {Promise<void>} Resolves once photos are loaded.
   */
  public async loadSaved(force = false): Promise<void> {
    if (this.loaded && !force) return;
    this.list = await this.storage.load();
    // No real capture yet (fresh install, simulator/browser): showcase the app
    // with bundled demo photos. They are never persisted, so a real capture
    // permanently replaces them. See {@link buildDemoPhotos}.
    if (this.list.length === 0) this.list = buildDemoPhotos();
    this.sync();
    this.loaded = true;
  }

  /**
   * Method takePhoto
   * @method takePhoto
   *
   * @description
   * Opens the camera, geolocates the capture, writes it to disk and persists it.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<UserPhoto | null>} The new photo, or `null` when cancelled.
   */
  public async takePhoto(): Promise<UserPhoto | null> {
    const result: MediaResult = await Camera.takePhoto({ quality: 100 });
    const webPath: string | undefined = result.webPath;
    if (!webPath) return null;

    // Photo captured: show the skeleton card while geolocating + writing the file.
    this.capturingState.set(true);
    try {
      const coords: Coordinates | null = await this.geolocation.getCurrentPosition();
      const saved: UserPhoto = await this.savePhoto(webPath, coords);

      this.list = [saved, ...this.list];
      this.sync();
      await this.storage.persist(this.list);
      return saved;
    } finally {
      this.capturingState.set(false);
    }
  }

  /**
   * Method deletePhoto
   * @method deletePhoto
   *
   * @description
   * Removes a photo from state, persists, then deletes the file.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {UserPhoto} photo - The photo to delete.
   *
   * @returns {Promise<void>} Resolves once deletion completes.
   */
  public async deletePhoto(photo: UserPhoto): Promise<void> {
    this.list = this.list.filter((candidate: UserPhoto) => candidate.id !== photo.id);
    this.sync();
    await this.storage.persist(this.list);
    await this.storage.remove(photo.filepath);
  }

  /**
   * Method toggleLike
   * @method toggleLike
   *
   * @description
   * Toggles the liked state of a photo and persists it.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {UserPhoto} photo - The photo to toggle.
   *
   * @returns {Promise<void>} Resolves once persisted.
   */
  public async toggleLike(photo: UserPhoto): Promise<void> {
    photo.liked = !photo.liked;
    this.sync();
    await this.storage.persist(this.list);
  }

  /**
   * Method markAsPurchased
   * @method markAsPurchased
   *
   * @description
   * Marks a photo as purchased and persists it.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {string} id - The id of the photo to mark.
   *
   * @returns {Promise<void>} Resolves once persisted.
   */
  public async markAsPurchased(id: string): Promise<void> {
    const photo: UserPhoto | undefined = this.list.find(
      (candidate: UserPhoto) => candidate.id === id,
    );
    if (!photo) return;

    photo.purchased = true;
    this.sync();
    await this.storage.persist(this.list);
  }
  //#endregion

  //#region Private Methods
  /**
   * Method sync
   * @method sync
   *
   * @description
   * Pushes a fresh array reference to the signal to notify consumers.
   *
   * @access private
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  private sync(): void {
    this.photosState.set([...this.list]);
  }

  /**
   * Method savePhoto
   * @method savePhoto
   *
   * @description
   * Reads the captured blob as base64, writes it to disk and builds the model.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {string} webPath - The temporary blob URL of the capture.
   * @param {Coordinates | null} coords - The capture coordinates, if any.
   *
   * @returns {Promise<UserPhoto>} The persisted photo model.
   */
  private async savePhoto(webPath: string, coords: Coordinates | null): Promise<UserPhoto> {
    const dataUrl: string = await this.readAsBase64(webPath);
    const filepath: string = await this.storage.write(dataUrl);

    return {
      id: filepath,
      filepath,
      webviewPath: dataUrl,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      date: Date.now(),
      liked: false,
      purchased: false,
    };
  }

  /**
   * Method readAsBase64
   * @method readAsBase64
   *
   * @description
   * Fetches the blob URL and converts it to a base64 data URL.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {string} webPath - The temporary blob URL to read.
   *
   * @returns {Promise<string>} The base64 data URL.
   */
  private async readAsBase64(webPath: string): Promise<string> {
    const response: Response = await fetch(webPath);
    const blob: Blob = await response.blob();
    return this.convertBlobToBase64(blob);
  }

  /**
   * Method convertBlobToBase64
   * @method convertBlobToBase64
   *
   * @description
   * Reads a blob as a base64 data URL using a `FileReader`.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {Blob} blob - The blob to convert.
   *
   * @returns {Promise<string>} The base64 data URL.
   */
  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader: FileReader = new FileReader();
      reader.addEventListener('error', () =>
        reject(reader.error ?? new Error('Failed to read photo blob')),
      );
      reader.addEventListener('load', () => resolve(reader.result as string));
      reader.readAsDataURL(blob);
    });
  }
  //#endregion
}
