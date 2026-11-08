import { Injectable } from '@angular/core';
import { Place } from '@app/models/places.model';
import { Preferences } from '@capacitor/preferences';
import { SupabaseService } from './supabase';

const CACHE_KEY = 'cachedPlaces';
const MAX_DISTANCE_METERS = 300;
const MAX_AGE_MINUTES = 60;
const SEARCH_RADIUS_METERS = 2000;

const STALE_MAX_DISTANCE_METERS = 3000;

interface PlacesCache {
  data: Place[];
  timestamp: number;
  location: { lat: number; lng: number };
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  constructor(private supabaseService: SupabaseService) {}

  private inflight: Promise<Place[]> | null = null;

  getPlaces(lat: number, lng: number): Promise<Place[]> {
    if (this.inflight) return this.inflight;

    this.inflight = this.loadPlaces(lat, lng).finally(() => {
      this.inflight = null;
    });

    return this.inflight;
  }

  private async loadPlaces(lat: number, lng: number): Promise<Place[]> {
    const cached = await this.getCached();
    let cacheDistance = Infinity;

    if (cached) {
      cacheDistance = this.getDistanceMeters(
        lat,
        lng,
        cached.location.lat,
        cached.location.lng,
      );
      const ageMinutes = (Date.now() - cached.timestamp) / 1000 / 60;

      if (cacheDistance < MAX_DISTANCE_METERS && ageMinutes < MAX_AGE_MINUTES) {
        return cached.data;
      }
    }

    const places = await this.fetchFromDatabase(lat, lng);

    if (places) {
      if (places.length > 0) {
        await Preferences.set({
          key: CACHE_KEY,
          value: JSON.stringify({
            data: places,
            timestamp: Date.now(),
            location: { lat, lng },
          } satisfies PlacesCache),
        });
      }
      return places;
    }

    if (cached && cacheDistance < STALE_MAX_DISTANCE_METERS) {
      console.warn('Using older cached places because the request failed');
      return cached.data;
    }

    return [];
  }

  private async getCached(): Promise<PlacesCache | null> {
    const { value } = await Preferences.get({ key: CACHE_KEY });
    return value ? JSON.parse(value) : null;
  }

  private async fetchFromDatabase(
    lat: number,
    lng: number,
  ): Promise<Place[] | null> {
    const latDelta = SEARCH_RADIUS_METERS / 111_320;
    const lngDelta =
      SEARCH_RADIUS_METERS / (111_320 * Math.cos((lat * Math.PI) / 180));

    const { data, error } = await this.supabaseService.client
      .from('places')
      .select('osm_id, name, type, latitude, longitude, address')
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta)
      .limit(1000);

    if (error) {
      console.error('Failed to load places:', error);
      return null;
    }

    return data
      .map(
        (row): Place => ({
          id: String(row.osm_id),
          name: row.name,
          type: row.type,
          lat: row.latitude,
          lng: row.longitude,
          address: row.address ?? undefined,
        }),
      )
      .filter(
        (place) =>
          this.getDistanceMeters(lat, lng, place.lat, place.lng) <=
          SEARCH_RADIUS_METERS,
      );
  }

  private getDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }
}
