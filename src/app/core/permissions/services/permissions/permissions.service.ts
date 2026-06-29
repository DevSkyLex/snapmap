import { Injectable } from '@angular/core';
import { Camera, type PermissionStatus as CameraPermissionStatus } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  Geolocation,
  type PermissionStatus as GeolocationPermissionStatus,
} from '@capacitor/geolocation';

/**
 * Service PermissionsService
 * @class PermissionsService
 *
 * @description
 * Checks and requests native permissions without ever throwing (challenge 5).
 * On the web, permissions are handled by the browser (`getUserMedia` /
 * Geolocation API), so the methods resolve to `true` and let the native call
 * trigger the prompt.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Injectable()
export class PermissionsService {
  //#region Methods
  /**
   * Method ensureCamera
   * @method ensureCamera
   *
   * @description
   * Ensures camera permission, requesting it once if needed.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<boolean>} `true` when the camera may be used.
   */
  public async ensureCamera(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;

    try {
      let status: CameraPermissionStatus = await Camera.checkPermissions();
      if (status.camera !== 'granted') {
        status = await Camera.requestPermissions({ permissions: ['camera'] });
      }
      return status.camera === 'granted' || status.camera === 'limited';
    } catch {
      return false;
    }
  }

  /**
   * Method ensureLocation
   * @method ensureLocation
   *
   * @description
   * Ensures location permission, requesting it once if needed.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<boolean>} `true` when geolocation may be used.
   */
  public async ensureLocation(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;

    try {
      let status: GeolocationPermissionStatus = await Geolocation.checkPermissions();
      if (status.location !== 'granted') {
        status = await Geolocation.requestPermissions({ permissions: ['location'] });
      }
      return status.location === 'granted';
    } catch {
      return false;
    }
  }
  //#endregion
}
