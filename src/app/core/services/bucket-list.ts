import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class BucketListService {
  constructor(private supabaseService: SupabaseService) {}

  async addToBucketList(place: {
    name: string;
    address?: string;
    lat: number;
    lng: number;
  }) {
    const { data: userData } = await this.supabaseService.client.auth.getUser();

    if (!userData.user) {
      throw new Error('Not logged in');
    }

    return this.supabaseService.client.from('bucket_lists').insert({
      user_id: userData.user.id,
      place_name: place.name,
      address: place.address ?? null,
      latitude: place.lat,
      longitude: place.lng,
    });
  }

  async getSavedPlaceKeys(): Promise<Set<string>> {
    const { data: userData } = await this.supabaseService.client.auth.getUser();
    if (!userData.user) return new Set();

    const { data } = await this.supabaseService.client
      .from('bucket_lists')
      .select('latitude, longitude')
      .eq('user_id', userData.user.id);

    if (!data) return new Set();

    return new Set(data.map((row) => `${row.latitude},${row.longitude}`));
  }
}
