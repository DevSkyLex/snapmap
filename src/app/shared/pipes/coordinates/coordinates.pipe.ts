import { Pipe, type PipeTransform } from '@angular/core';

/**
 * Interface GeoPoint
 * @interface GeoPoint
 *
 * @description
 * Minimal geographic point consumed by {@link CoordinatesPipe}. Kept local so
 * the shared layer never depends on a feature model (concern-first): any object
 * exposing `lat`/`lng` (e.g. a `UserPhoto`) is structurally compatible.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export interface GeoPoint {
  /**
   * Property lat
   *
   * @description
   * Latitude in decimal degrees, or `null` when unknown.
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
   * Longitude in decimal degrees, or `null` when unknown.
   *
   * @since 1.0.0
   *
   * @type {number | null}
   */
  lng: number | null;
}

/**
 * Pipe CoordinatesPipe
 * @class CoordinatesPipe
 *
 * @description
 * Formats a geographic point as a human-readable GPS readout in the app's
 * cartographic voice, e.g. `43.530° N · 5.447° E`. Latitude/longitude signs are
 * rendered as hemisphere letters (N/S, E/W) and magnitudes are fixed to three
 * decimals (~110 m precision). Returns `null` when either coordinate is missing
 * so templates can hide the line entirely. Pure pipe: recomputes only when its
 * input reference changes.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Pipe({ name: 'coordinates' })
export class CoordinatesPipe implements PipeTransform {
  //#region Public Methods
  /**
   * Method transform
   * @method transform
   *
   * @description
   * Builds the formatted GPS readout, or `null` when the point is unlocated.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {GeoPoint | null | undefined} point - The point to format.
   *
   * @returns {string | null} The readout, or `null` when unlocated.
   */
  public transform(point: GeoPoint | null | undefined): string | null {
    if (!point || point.lat === null || point.lng === null) return null;

    const latitude = `${Math.abs(point.lat).toFixed(3)}° ${point.lat >= 0 ? 'N' : 'S'}`;
    const longitude = `${Math.abs(point.lng).toFixed(3)}° ${point.lng >= 0 ? 'E' : 'W'}`;

    return `${latitude} · ${longitude}`;
  }
  //#endregion
}
