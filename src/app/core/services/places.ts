import { Injectable } from '@angular/core';
import { Place } from '@app/models/places.model';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  async getPlaces(lat: number, lng: number): Promise<Place[]> {
    const query = `
      [out:json];
      (
        node["amenity"="bar"](around:2000,${lat},${lng});
        node["amenity"="pub"](around:2000,${lat},${lng});
        node["amenity"="nightclub"](around:2000,${lat},${lng});
      );
      out;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    const data = await response.json();

    return data.elements.map((place: any) => ({
      name: place.tags?.name || 'Tundmatu koht',
      type: place.tags?.amenity,
      lat: place.lat,
      lng: place.lon,
    }));
  }
}
