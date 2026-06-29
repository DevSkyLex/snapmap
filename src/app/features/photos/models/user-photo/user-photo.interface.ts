/**
 * Interface UserPhoto
 * @interface UserPhoto
 *
 * @description
 * Front-end view model of a photo taken by the user. `webviewPath` is always a
 * `data:image/jpeg;base64,...` data URL (never a temporary `blob://`).
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export interface UserPhoto {
  /**
   * Property id
   *
   * @description
   * Unique identifier (equal to the on-disk file name).
   *
   * @since 1.0.0
   *
   * @type {string}
   */
  id: string;

  /**
   * Property filepath
   *
   * @description
   * File name within `Directory.Data`.
   *
   * @since 1.0.0
   *
   * @type {string}
   */
  filepath: string;

  /**
   * Property webviewPath
   *
   * @description
   * Displayable image as a base64 data URL.
   *
   * @since 1.0.0
   *
   * @type {string}
   */
  webviewPath: string;

  /**
   * Property lat
   *
   * @description
   * Capture latitude, or `null` when geolocation was unavailable/denied.
   *
   * @since 1.0.0
   *
   * @type {number | null}
   */
  lat: number | null;

  /**
   * Property lng
   *
   * @description
   * Capture longitude, or `null` when geolocation was unavailable/denied.
   *
   * @since 1.0.0
   *
   * @type {number | null}
   */
  lng: number | null;

  /**
   * Property date
   *
   * @description
   * Capture timestamp (`Date.now()`).
   *
   * @since 1.0.0
   *
   * @type {number}
   */
  date: number;

  /**
   * Property liked
   *
   * @description
   * Whether the photo is liked (persisted).
   *
   * @since 1.0.0
   *
   * @type {boolean}
   */
  liked: boolean;

  /**
   * Property purchased
   *
   * @description
   * Whether the photo is purchased (un-blurred in the shop).
   *
   * @since 1.0.0
   *
   * @type {boolean}
   */
  purchased: boolean;

  /**
   * Property locationName
   *
   * @description
   * Real place name resolved via reverse geocoding (cached, optional).
   *
   * @since 1.0.0
   *
   * @type {string | undefined}
   */
  locationName?: string;
}
