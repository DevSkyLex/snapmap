import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { PhotoStorageService } from '@features/photos/data-access';
import { PHOTO_LIBRARY } from '@features/photos/ports/photo-library';
import { PhotoService } from '@features/photos/services/photo/photo.service';

/**
 * Provider providePhotoLibrary
 *
 * @description
 * Provisions the "photos" domain at the composition root (a singleton shared
 * across every tab) and binds the {@link PHOTO_LIBRARY} port to its concrete
 * adapter {@link PhotoService} with `useExisting` (no double instantiation).
 *
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [providePhotoLibrary()],
 * };
 * ```
 *
 * @returns {EnvironmentProviders} The providers wiring the photo domain.
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export function providePhotoLibrary(): EnvironmentProviders {
  return makeEnvironmentProviders([
    PhotoStorageService,
    PhotoService,
    { provide: PHOTO_LIBRARY, useExisting: PhotoService },
  ]);
}
