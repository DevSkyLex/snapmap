import { provideHttpClient } from '@angular/common/http';
import { type ApplicationConfig } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withPreloading,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideEnvironment } from '@core/config';
import { provideFeedback } from '@core/feedback';
import { GeocodingService } from '@core/geocoding';
import { GeolocationService } from '@core/geolocation';
import { PermissionsService } from '@core/permissions';
import { providePhotoLibrary } from '@features/photos';
import { routes } from './app.routes';

/**
 * Constant appConfig
 *
 * @description
 * Application composition root. Every app-wide concern is provisioned here
 * (no `providedIn: 'root'`): routing, HTTP, environment, feedback, native
 * helpers and the shared photo domain (bound to the `PHOTO_LIBRARY` port).
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),

    // core
    provideEnvironment(),
    provideFeedback(),
    GeolocationService,
    GeocodingService,
    PermissionsService,

    // photos domain (shared singleton + PHOTO_LIBRARY port)
    providePhotoLibrary(),
  ],
};
