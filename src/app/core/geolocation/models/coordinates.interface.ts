/**
 * Interface Coordinates
 * @interface Coordinates
 *
 * @description
 * Latitude / longitude pair returned by the {@link GeolocationService}.
 * Type-only.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export interface Coordinates {
  /**
   * Property lat
   * @readonly
   *
   * @description
   * Latitude in decimal degrees.
   *
   * @since 1.0.0
   *
   * @type {number}
   */
  readonly lat: number;

  /**
   * Property lng
   * @readonly
   *
   * @description
   * Longitude in decimal degrees.
   *
   * @since 1.0.0
   *
   * @type {number}
   */
  readonly lng: number;
}
