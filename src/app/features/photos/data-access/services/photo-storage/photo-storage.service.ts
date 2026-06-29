import { Injectable } from '@angular/core';
import { Directory, Filesystem, type ReadFileResult } from '@capacitor/filesystem';
import { type GetResult, Preferences } from '@capacitor/preferences';
import type { UserPhoto } from '@features/photos/models';

/**
 * Type PhotoMetadata
 * @typedef {Omit<UserPhoto, 'webviewPath'>} PhotoMetadata
 *
 * @description
 * Persisted form of a photo: everything except the heavy base64 `webviewPath`,
 * which is re-hydrated from disk on load.
 *
 * @since 1.0.0
 */
type PhotoMetadata = Omit<UserPhoto, 'webviewPath'>;

/**
 * Service PhotoStorageService
 * @class PhotoStorageService
 *
 * @description
 * Data-access layer of the "photos" domain: pure persistence (image bytes on
 * disk via Filesystem, metadata via Preferences). No presentation logic nor
 * orchestration here. Only metadata is stored in Preferences to keep it light;
 * images live on disk and are re-read on load.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Injectable()
export class PhotoStorageService {
  //#region Properties
  /**
   * Property PHOTO_STORAGE
   * @readonly
   *
   * @description
   * Preferences key under which photo metadata is stored.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {string}
   */
  private static readonly PHOTO_STORAGE: string = 'photos';
  //#endregion

  //#region Methods
  /**
   * Method load
   * @method load
   *
   * @description
   * Reloads photos from Preferences and re-hydrates each image from disk.
   * Missing files are skipped instead of throwing.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<UserPhoto[]>} The hydrated photos, ordered as persisted.
   */
  public async load(): Promise<UserPhoto[]> {
    const stored: GetResult = await Preferences.get({ key: PhotoStorageService.PHOTO_STORAGE });
    const metadata: PhotoMetadata[] = stored.value
      ? (JSON.parse(stored.value) as PhotoMetadata[])
      : [];

    const hydrated: ReadonlyArray<UserPhoto | null> = await Promise.all(
      metadata.map((meta: PhotoMetadata) => this.hydrate(meta)),
    );

    return hydrated.filter((photo: UserPhoto | null): photo is UserPhoto => photo !== null);
  }

  /**
   * Method persist
   * @method persist
   *
   * @description
   * Saves photo metadata (without the base64 payload) to Preferences.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {ReadonlyArray<UserPhoto>} photos - The photos to persist.
   *
   * @returns {Promise<void>} Resolves once metadata is written.
   */
  public async persist(photos: ReadonlyArray<UserPhoto>): Promise<void> {
    const metadata: PhotoMetadata[] = photos.map((photo: UserPhoto) => this.toMetadata(photo));
    await Preferences.set({
      key: PhotoStorageService.PHOTO_STORAGE,
      value: JSON.stringify(metadata),
    });
  }

  /**
   * Method write
   * @method write
   *
   * @description
   * Writes an image file to disk from a base64 data URL.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {string} dataUrl - The `data:image/jpeg;base64,...` payload.
   *
   * @returns {Promise<string>} The generated file name.
   */
  public async write(dataUrl: string): Promise<string> {
    const rawBase64: string = dataUrl.split(',')[1] ?? '';
    const fileName: string = `${Date.now()}.jpeg`;

    await Filesystem.writeFile({
      path: fileName,
      data: rawBase64,
      directory: Directory.Data,
    });

    return fileName;
  }

  /**
   * Method remove
   * @method remove
   *
   * @description
   * Deletes an image file from disk (no-op if already absent).
   *
   * @access public
   * @since 1.0.0
   *
   * @param {string} filepath - The file name to delete.
   *
   * @returns {Promise<void>} Resolves once deletion is attempted.
   */
  public async remove(filepath: string): Promise<void> {
    try {
      await Filesystem.deleteFile({ path: filepath, directory: Directory.Data });
    } catch {
      // File already absent: harmless.
    }
  }

  /**
   * Method hydrate
   * @method hydrate
   *
   * @description
   * Re-reads a single photo's bytes from disk, or `null` if the file is gone.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {PhotoMetadata} meta - The persisted metadata to hydrate.
   *
   * @returns {Promise<UserPhoto | null>} The hydrated photo, or `null`.
   */
  private async hydrate(meta: PhotoMetadata): Promise<UserPhoto | null> {
    try {
      const file: ReadFileResult = await Filesystem.readFile({
        path: meta.filepath,
        directory: Directory.Data,
      });
      return { ...meta, webviewPath: `data:image/jpeg;base64,${file.data as string}` };
    } catch {
      return null;
    }
  }

  /**
   * Method toMetadata
   * @method toMetadata
   *
   * @description
   * Projects a photo to its persisted metadata (drops `webviewPath`).
   *
   * @access private
   * @since 1.0.0
   *
   * @param {UserPhoto} photo - The photo to project.
   *
   * @returns {PhotoMetadata} The metadata to persist.
   */
  private toMetadata(photo: UserPhoto): PhotoMetadata {
    return {
      id: photo.id,
      filepath: photo.filepath,
      lat: photo.lat,
      lng: photo.lng,
      date: photo.date,
      liked: photo.liked,
      purchased: photo.purchased,
      locationName: photo.locationName,
    };
  }
  //#endregion
}
