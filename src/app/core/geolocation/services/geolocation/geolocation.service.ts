import { Injectable } from '@angular/core';
import { Geolocation, type Position } from '@capacitor/geolocation';
import type { Coordinates } from '@core/geolocation/models/coordinates.interface';

/**
 * Service GeolocationService
 * @class GeolocationService
 *
 * @description
 * Infrastructure wrapper around Capacitor's Geolocation API. Returns `null`
 * instead of throwing when the position is unavailable or denied, so callers
 * can degrade gracefully (challenge 5 — refusing geolocation must not block the map).
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Injectable()
export class GeolocationService {
  //#region Methods
  /**
   * Method getCurrentPosition
   * @method getCurrentPosition
   *
   * @description
   * Resolves the device's current position, or `null` when it cannot be read
   * (permission denied, timeout, unsupported platform). Never rejects.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<Coordinates | null>} The current coordinates, or `null`.
   */
  public async getCurrentPosition(): Promise<Coordinates | null> {
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10_000,
      });

      return { lat: position.coords.latitude, lng: position.coords.longitude };
    } catch {
      return null;
    }
  }
  //#endregion
}
