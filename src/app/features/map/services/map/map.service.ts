import { inject, Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { ENV_CONFIG } from '@core/config';
import type { EnvironmentConfig } from '@core/config';
import type { UserPhoto } from '@features/photos/models';

/**
 * Type LocatedPhoto
 * @typedef {UserPhoto & { lat: number; lng: number }} LocatedPhoto
 *
 * @description
 * A photo guaranteed to carry coordinates (after filtering out null positions).
 *
 * @since 1.0.0
 */
type LocatedPhoto = UserPhoto & { lat: number; lng: number };

/**
 * Interface PhotoFeatureProperties
 * @interface PhotoFeatureProperties
 *
 * @description
 * Properties carried by an individual (unclustered) photo feature.
 *
 * @since 1.0.0
 */
interface PhotoFeatureProperties {
  readonly id: string;
}

/**
 * Interface ClusterFeatureProperties
 * @interface ClusterFeatureProperties
 *
 * @description
 * Properties carried by a Mapbox cluster feature.
 *
 * @since 1.0.0
 */
interface ClusterFeatureProperties {
  readonly cluster: true;
  readonly cluster_id: number;
  readonly point_count: number;
}

/**
 * Type FeatureProperties
 * @typedef {(PhotoFeatureProperties | ClusterFeatureProperties)} FeatureProperties
 *
 * @description
 * Discriminated union of source-feature properties (`'cluster' in props`).
 *
 * @since 1.0.0
 */
type FeatureProperties = PhotoFeatureProperties | ClusterFeatureProperties;

/**
 * Constant DEFAULT_CENTER
 *
 * @description
 * Fallback map center when geolocation is denied/unavailable (challenge 5): Paris.
 *
 * @since 1.0.0
 */
const DEFAULT_CENTER: readonly [number, number] = [2.3522, 48.8566];

/**
 * Constant SPIDER_MAX
 *
 * @description
 * Cluster size threshold: at or below, photos are spread out (spiderfy); above,
 * a list modal is opened (challenge 3).
 *
 * @since 1.0.0
 */
const SPIDER_MAX = 6;

/**
 * Service MapService
 * @class MapService
 *
 * @description
 * Behavioral service of the "map" feature: wraps Mapbox GL and handles HTML
 * marker rendering (thumbnails), clustering, spiderfy and photo/cluster opening
 * through callbacks (challenge 3). Provisioned at the map route level.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Injectable()
export class MapService {
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
   * Property photoIndex
   * @readonly
   *
   * @description
   * Lookup from photo id to model, used to render thumbnails.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {Map<string, UserPhoto>}
   */
  private readonly photoIndex: Map<string, UserPhoto> = new Map<string, UserPhoto>();

  /**
   * Property leafThumbCache
   * @readonly
   *
   * @description
   * Cache from cluster id to its representative thumbnail data URL.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {Map<number, string>}
   */
  private readonly leafThumbCache: Map<number, string> = new Map<number, string>();

  /**
   * Property map
   *
   * @description
   * The Mapbox map instance, once initialized.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {mapboxgl.Map | undefined}
   */
  private map: mapboxgl.Map | undefined;

  /**
   * Property markersOnScreen
   *
   * @description
   * Currently rendered HTML markers, keyed by feature id.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {Record<string, mapboxgl.Marker>}
   */
  private markersOnScreen: Record<string, mapboxgl.Marker> = {};

  /**
   * Property spiderMarkers
   *
   * @description
   * Temporary markers spread around a cluster while spiderfied.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {mapboxgl.Marker[]}
   */
  private spiderMarkers: mapboxgl.Marker[] = [];

  /**
   * Property onPhotoOpen
   *
   * @description
   * Callback invoked when a photo marker is clicked.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {((id: string) => void) | undefined}
   */
  public onPhotoOpen?: (id: string) => void;

  /**
   * Property onClusterOpen
   *
   * @description
   * Callback invoked when a large cluster is clicked.
   *
   * @access public
   * @since 1.0.0
   *
   * @type {((photos: UserPhoto[]) => void) | undefined}
   */
  public onClusterOpen?: (photos: UserPhoto[]) => void;
  //#endregion

  //#region Public Methods
  /**
   * Method initMap
   * @method initMap
   *
   * @description
   * Creates the Mapbox map centered on the given coordinates (or a default).
   *
   * @access public
   * @since 1.0.0
   *
   * @param {string} container - The id of the host element.
   * @param {readonly [number, number] | null} center - The center, or `null` for the default.
   *
   * @returns {Promise<void>} Resolves once the map style has loaded.
   */
  public initMap(container: string, center: readonly [number, number] | null): Promise<void> {
    const resolvedCenter: readonly [number, number] = center ?? DEFAULT_CENTER;

    return new Promise<void>((resolve, reject) => {
      const map: mapboxgl.Map = new mapboxgl.Map({
        accessToken: this.env.mapBox.accessToken,
        container,
        style: 'mapbox://styles/mapbox/streets-v12',
        zoom: center ? 13 : 4,
        center: [resolvedCenter[0], resolvedCenter[1]],
      });
      this.map = map;
      map.on('load', () => resolve());
      map.on('error', (event) => reject(event.error));
    });
  }

  /**
   * Method renderPhotos
   * @method renderPhotos
   *
   * @description
   * (Re)loads the photo source and renders clustered HTML thumbnail markers.
   *
   * @access public
   * @since 1.0.0
   *
   * @param {ReadonlyArray<UserPhoto>} photos - The photos to plot.
   *
   * @returns {void} Nothing.
   */
  public renderPhotos(photos: ReadonlyArray<UserPhoto>): void {
    const map: mapboxgl.Map | undefined = this.map;
    if (!map) return;

    const located: LocatedPhoto[] = photos.filter(
      (photo: UserPhoto): photo is LocatedPhoto => photo.lat !== null && photo.lng !== null,
    );

    this.photoIndex.clear();
    this.leafThumbCache.clear();
    for (const photo of located) this.photoIndex.set(photo.id, photo);

    const data: GeoJSON.FeatureCollection<GeoJSON.Point, PhotoFeatureProperties> = {
      type: 'FeatureCollection',
      features: located.map((photo: LocatedPhoto) => ({
        type: 'Feature',
        properties: { id: photo.id },
        geometry: { type: 'Point', coordinates: [photo.lng, photo.lat] },
      })),
    };

    const existing = map.getSource('photos') as mapboxgl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(data);
      this.updateMarkers();
      return;
    }

    map.addSource('photos', {
      type: 'geojson',
      data,
      cluster: true,
      clusterRadius: 60,
      clusterMaxZoom: 16,
    });

    // Invisible layer: forces tile generation so querySourceFeatures returns
    // clusters/points. The visuals are HTML markers (thumbnails).
    map.addLayer({
      id: 'photos-src',
      type: 'circle',
      source: 'photos',
      paint: { 'circle-radius': 0, 'circle-opacity': 0 },
    });

    map.on('render', () => this.updateMarkers());
    this.updateMarkers();
  }

  /**
   * Method destroy
   * @method destroy
   *
   * @description
   * Tears down all markers and the map instance.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  public destroy(): void {
    for (const marker of Object.values(this.markersOnScreen)) marker.remove();
    this.markersOnScreen = {};
    this.clearSpider();
    this.map?.remove();
    this.map = undefined;
  }
  //#endregion

  //#region Private Methods
  /**
   * Method updateMarkers
   * @method updateMarkers
   *
   * @description
   * Reconciles HTML markers (clusters and photos) against the current viewport.
   *
   * @access private
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  private updateMarkers(): void {
    const map: mapboxgl.Map | undefined = this.map;
    if (!map || !map.getSource('photos') || !map.isSourceLoaded('photos')) return;

    const newMarkers: Record<string, mapboxgl.Marker> = {};
    const features = map.querySourceFeatures('photos');

    for (const feature of features) {
      const properties = feature.properties as FeatureProperties | null;
      if (!properties) continue;

      const coordinates: [number, number] = (feature.geometry as GeoJSON.Point).coordinates as [
        number,
        number,
      ];

      if ('cluster' in properties) {
        const id: string = `c_${properties.cluster_id}`;
        newMarkers[id] =
          this.markersOnScreen[id] ??
          this.createClusterMarker(properties.cluster_id, properties.point_count, coordinates);
      } else {
        const id: string = `p_${properties.id}`;
        newMarkers[id] =
          this.markersOnScreen[id] ?? this.createPhotoMarker(properties.id, coordinates);
      }
    }

    for (const id of Object.keys(newMarkers)) {
      if (!this.markersOnScreen[id]) newMarkers[id]?.addTo(map);
    }
    for (const id of Object.keys(this.markersOnScreen)) {
      if (!newMarkers[id]) this.markersOnScreen[id]?.remove();
    }
    this.markersOnScreen = newMarkers;
  }

  /**
   * Method createPhotoMarker
   * @method createPhotoMarker
   *
   * @description
   * Builds a round thumbnail marker for a single photo.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {string} id - The photo id.
   * @param {[number, number]} coordinates - The marker coordinates.
   *
   * @returns {mapboxgl.Marker} The created marker.
   */
  private createPhotoMarker(id: string, coordinates: [number, number]): mapboxgl.Marker {
    const photo: UserPhoto | undefined = this.photoIndex.get(id);
    const element: HTMLDivElement = document.createElement('div');
    element.className = 'photo-pin';
    if (photo) element.style.backgroundImage = `url("${photo.webviewPath}")`;
    element.addEventListener('click', (event: MouseEvent) => {
      event.stopPropagation();
      this.onPhotoOpen?.(id);
    });
    return new mapboxgl.Marker({ element }).setLngLat(coordinates);
  }

  /**
   * Method createClusterMarker
   * @method createClusterMarker
   *
   * @description
   * Builds a clustered marker (first thumbnail + count badge, capped at 99+).
   *
   * @access private
   * @since 1.0.0
   *
   * @param {number} clusterId - The Mapbox cluster id.
   * @param {number} count - The number of photos in the cluster.
   * @param {[number, number]} coordinates - The marker coordinates.
   *
   * @returns {mapboxgl.Marker} The created marker.
   */
  private createClusterMarker(
    clusterId: number,
    count: number,
    coordinates: [number, number],
  ): mapboxgl.Marker {
    const element: HTMLDivElement = document.createElement('div');
    element.className = 'photo-pin cluster-pin';

    const badge: HTMLSpanElement = document.createElement('span');
    badge.className = 'cluster-badge';
    badge.textContent = count > 99 ? '99+' : String(count);
    element.append(badge);

    void this.getClusterThumb(clusterId).then((thumb: string | null) => {
      if (thumb) element.style.backgroundImage = `url("${thumb}")`;
    });

    element.addEventListener('click', (event: MouseEvent) => {
      event.stopPropagation();
      this.onClusterClick(clusterId, count, coordinates);
    });

    return new mapboxgl.Marker({ element }).setLngLat(coordinates);
  }

  /**
   * Method getClusterThumb
   * @method getClusterThumb
   *
   * @description
   * Resolves the thumbnail of a cluster's first leaf (cached).
   *
   * @access private
   * @since 1.0.0
   *
   * @param {number} clusterId - The cluster id.
   *
   * @returns {Promise<string | null>} The thumbnail data URL, or `null`.
   */
  private getClusterThumb(clusterId: number): Promise<string | null> {
    const cached: string | undefined = this.leafThumbCache.get(clusterId);
    if (cached) return Promise.resolve(cached);

    const source = this.map?.getSource('photos') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return Promise.resolve(null);

    return new Promise<string | null>((resolve) => {
      source.getClusterLeaves(clusterId, 1, 0, (error, leaves) => {
        const leaf: GeoJSON.Feature | undefined = leaves?.[0];
        if (error || !leaf) {
          resolve(null);
          return;
        }
        const id: string = (leaf.properties as PhotoFeatureProperties).id;
        const thumb: string | null = this.photoIndex.get(id)?.webviewPath ?? null;
        if (thumb) this.leafThumbCache.set(clusterId, thumb);
        resolve(thumb);
      });
    });
  }

  /**
   * Method onClusterClick
   * @method onClusterClick
   *
   * @description
   * Spreads a small cluster (spiderfy) or opens a list modal for a large one.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {number} clusterId - The cluster id.
   * @param {number} count - The number of photos in the cluster.
   * @param {[number, number]} coordinates - The cluster center.
   *
   * @returns {void} Nothing.
   */
  private onClusterClick(clusterId: number, count: number, coordinates: [number, number]): void {
    const source = this.map?.getSource('photos') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    if (count <= SPIDER_MAX) {
      source.getClusterLeaves(clusterId, count, 0, (error, leaves) => {
        if (error || !leaves) return;
        this.spiderfy(coordinates, leaves);
      });
    } else {
      source.getClusterLeaves(clusterId, 1000, 0, (error, leaves) => {
        if (error || !leaves) return;
        const photos: UserPhoto[] = leaves
          .map((leaf: GeoJSON.Feature) =>
            this.photoIndex.get((leaf.properties as PhotoFeatureProperties).id),
          )
          .filter((photo: UserPhoto | undefined): photo is UserPhoto => photo !== undefined);
        this.onClusterOpen?.(photos);
      });
    }
  }

  /**
   * Method spiderfy
   * @method spiderfy
   *
   * @description
   * Spreads a cluster's leaves visually around its center until the map moves.
   *
   * @access private
   * @since 1.0.0
   *
   * @param {[number, number]} center - The cluster center.
   * @param {ReadonlyArray<GeoJSON.Feature>} leaves - The cluster's leaves.
   *
   * @returns {void} Nothing.
   */
  private spiderfy(center: [number, number], leaves: ReadonlyArray<GeoJSON.Feature>): void {
    const map: mapboxgl.Map | undefined = this.map;
    if (!map) return;
    this.clearSpider();

    const radius = 72;
    const count: number = leaves.length;
    leaves.forEach((leaf: GeoJSON.Feature, index: number) => {
      const photo: UserPhoto | undefined = this.photoIndex.get(
        (leaf.properties as PhotoFeatureProperties).id,
      );
      if (!photo) return;

      const angle: number = (2 * Math.PI * index) / count;
      const element: HTMLDivElement = document.createElement('div');
      element.className = 'photo-pin spider-pin';
      element.style.backgroundImage = `url("${photo.webviewPath}")`;
      element.style.transform = `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`;
      element.addEventListener('click', (event: MouseEvent) => {
        event.stopPropagation();
        this.onPhotoOpen?.(photo.id);
      });
      this.spiderMarkers.push(new mapboxgl.Marker({ element }).setLngLat(center).addTo(map));
    });

    map.once('movestart', () => this.clearSpider());
  }

  /**
   * Method clearSpider
   * @method clearSpider
   *
   * @description
   * Removes all temporary spiderfied markers.
   *
   * @access private
   * @since 1.0.0
   *
   * @returns {void} Nothing.
   */
  private clearSpider(): void {
    for (const marker of this.spiderMarkers) marker.remove();
    this.spiderMarkers = [];
  }
  //#endregion
}
