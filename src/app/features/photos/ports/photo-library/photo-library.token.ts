import { InjectionToken } from '@angular/core';
import type { PhotoLibrary } from '@features/photos/ports/photo-library/photo-library.interface';

/**
 * InjectionToken PHOTO_LIBRARY
 *
 * @description
 * Token for the {@link PhotoLibrary} port. Bound to its concrete adapter by
 * {@link providePhotoLibrary}.
 *
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * private readonly library: PhotoLibrary = inject<PhotoLibrary>(PHOTO_LIBRARY);
 * ```
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export const PHOTO_LIBRARY: InjectionToken<PhotoLibrary> = new InjectionToken<PhotoLibrary>(
  'PHOTO_LIBRARY',
);
