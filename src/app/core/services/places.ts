import { Injectable } from '@angular/core';
import { Place } from '@app/models/places.model';
import { Preferences } from '@capacitor/preferences';

const CACHE_KEY = 'cachedPlaces';
const MAX_DISTANCE_METERS = 300;
const MAX_AGE_MINUTES = 60;

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  async getPlaces(lat: number, lng: number): Promise<Place[]> {
    const cached = await this.getCached();

    if (cached) {
      const distance = this.getDistanceMeters(
        lat,
        lng,
        cached.location.lat,
        cached.location.lng,
      );
      const ageMinutes = (Date.now() - cached.timestamp) / 1000 / 60;

      if (distance < MAX_DISTANCE_METERS && ageMinutes < MAX_AGE_MINUTES) {
        return cached.data;
      }
    }

    const places = await this.fetchFromOverpass(lat, lng);

    if (places.length > 0) {
      await Preferences.set({
        key: CACHE_KEY,
        value: JSON.stringify({
          data: places,
          timestamp: Date.now(),
          location: { lat, lng },
        }),
      });
    }

    return places;
  }

  private async getCached() {
    const { value } = await Preferences.get({ key: CACHE_KEY });
    return value ? JSON.parse(value) : null;
  }

  private async fetchFromOverpass(lat: number, lng: number): Promise<Place[]> {
    const query = `[out:json][timeout:10];(node["amenity"="bar"](around:2000,${lat},${lng});node["amenity"="pub"](around:2000,${lat},${lng});node["amenity"="nightclub"](around:2000,${lat},${lng}););out;`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Overpass error: ${response.status}`);

      const data = await response.json();

      return data.elements.map((el: any) => ({
        id: String(el.id),
        name: el.tags?.name || 'Tundmatu koht',
        type: el.tags?.amenity,
        lat: el.lat,
        lng: el.lon,
        address: this.getAddress(el.tags),
      }));
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch places: ', err);
      return [];
    }
  }

  private getAddress(tags: any): string | undefined {
    const parts: string[] = [];
    if (tags?.['addr:street']) parts.push(tags['addr:street']);
    if (tags?.['addr:housenumber']) parts.push(tags['addr:housenumber']);
    return parts.length ? parts.join(', ') : undefined;
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
