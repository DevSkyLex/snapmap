import type { Signal } from '@angular/core';
import type { UserPhoto } from '@features/photos/models';

/**
 * Interface PhotoLibrary
 * @interface PhotoLibrary
 *
 * @description
 * Contract published by the "photos" feature and consumed by sibling features
 * (`gallery`, `map`, `shop`). Consumers inject the {@link PHOTO_LIBRARY} token
 * rather than the concrete service, avoiding any deep import.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export interface PhotoLibrary {
  /**
   * Property photos
   * @readonly
   *
   * @description
   * Reactive collection of photos.
   *
   * @since 1.0.0
   *
   * @type {Signal<ReadonlyArray<UserPhoto>>}
   */
  readonly photos: Signal<ReadonlyArray<UserPhoto>>;

  /**
   * Property isCapturing
   * @readonly
   *
   * @description
   * `true` while a freshly taken photo is being saved (skeleton card).
   *
   * @since 1.0.0
   *
   * @type {Signal<boolean>}
   */
  readonly isCapturing: Signal<boolean>;

  /**
   * Method loadSaved
   * @method loadSaved
   *
   * @description
   * Loads persisted photos once (idempotent unless `force` is set).
   *
   * @param {boolean} [force] - Reload even if already loaded.
   *
   * @returns {Promise<void>} Resolves once photos are loaded.
   */
  loadSaved(force?: boolean): Promise<void>;

  /**
   * Method takePhoto
   * @method takePhoto
   *
   * @description
   * Captures, geolocates and persists a new photo.
   *
   * @returns {Promise<UserPhoto | null>} The new photo, or `null` if cancelled.
   */
  takePhoto(): Promise<UserPhoto | null>;

  /**
   * Method deletePhoto
   * @method deletePhoto
   *
   * @description
   * Removes a photo from state and disk.
   *
   * @param {UserPhoto} photo - The photo to delete.
   *
   * @returns {Promise<void>} Resolves once deletion completes.
   */
  deletePhoto(photo: UserPhoto): Promise<void>;

  /**
   * Method toggleLike
   * @method toggleLike
   *
   * @description
   * Toggles the liked state of a photo and persists it.
   *
   * @param {UserPhoto} photo - The photo to toggle.
   *
   * @returns {Promise<void>} Resolves once persisted.
   */
  toggleLike(photo: UserPhoto): Promise<void>;

  /**
   * Method markAsPurchased
   * @method markAsPurchased
   *
   * @description
   * Marks a photo as purchased and persists it.
   *
   * @param {string} id - The id of the photo to mark.
   *
   * @returns {Promise<void>} Resolves once persisted.
   */
  markAsPurchased(id: string): Promise<void>;
}
