import { inject, Injectable } from '@angular/core';
import { ENV_CONFIG } from '@core/config';
import type { EnvironmentConfig } from '@core/config';

/**
 * Interface MapboxGeocodingResponse
 * @interface MapboxGeocodingResponse
 *
 * @description
 * Minimal shape of the Mapbox reverse-geocoding response actually consumed here.
 *
 * @since 1.0.0
 */
interface MapboxGeocodingResponse {
  readonly features?: ReadonlyArray<{ readonly place_name?: string }>;
}

/**
 * Service GeocodingService
 * @class GeocodingService
 *
 * @description
 * Reverse geocoding (challenge 2): turns coordinates into a human-readable
 * place name (e.g. "Aix-en-Provence, Cours Mirabeau") via the Mapbox Geocoding
 * API. Results are memoized to avoid repeated network calls.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Injectable()
export class GeocodingService {
  //#region Properties
  /**
   * Property env
   * @readonly
   *
   * @description
   * Application environment (Mapbox access token).
   *
   * @access private
   * @since 1.0.0
   *
   * @type {EnvironmentConfig}
   */
  private readonly env: EnvironmentConfig = inject<EnvironmentConfig>(ENV_CONFIG);

  /**
   * Property cache
   * @readonly
   *
   * @description
   * Memoization cache keyed by rounded `lng,lat`.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {Map<string, string>}
   */
  private readonly cache: Map<string, string> = new Map<string, string>();
  //#endregion

  //#region Methods
  /**
   * Method reverseGeocode
   * @method reverseGeocode
   *
   * @description
   * Resolves a place name for the given coordinates. Never rejects: returns a
   * fallback label when the request fails.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {number} lng - Longitude in decimal degrees.
   * @param {number} lat - Latitude in decimal degrees.
   *
   * @returns {Promise<string>} The resolved place name, or a fallback label.
   */
  public async reverseGeocode(lng: number, lat: number): Promise<string> {
    const key: string = `${lng.toFixed(5)},${lat.toFixed(5)}`;
    const cached: string | undefined = this.cache.get(key);
    if (cached) return cached;

    const token: string = this.env.mapBox.accessToken;
    const url: string =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
      `?access_token=${token}&language=fr&limit=1`;

    try {
      const response: Response = await fetch(url);
      if (!response.ok) return 'Localisation indisponible';

      const data = (await response.json()) as MapboxGeocodingResponse;
      const name: string = data.features?.[0]?.place_name ?? 'Lieu inconnu';
      this.cache.set(key, name);
      return name;
    } catch {
      return 'Localisation indisponible';
    }
  }
  //#endregion
}
