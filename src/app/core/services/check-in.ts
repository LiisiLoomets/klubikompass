import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

const PHOTO_BUCKET = 'check-in-photos';

export interface NewCheckIn {
  placeName: string;
  address?: string;
  lat: number;
  lng: number;
  note?: string;
  visitedAt: string;
  moods: string[];
  drinks: string[];
  photo?: Blob;
}

@Injectable({
  providedIn: 'root',
})
export class CheckInService {
  constructor(private supabaseService: SupabaseService) {}

  async createCheckIn(input: NewCheckIn) {
    const client = this.supabaseService.client;

    let imagePath: string | null = null;
    let checkInId: string | null = null;

    try {
      if (input.photo) {
        imagePath = await this.uploadPhoto(input.photo);
      }

      const { data: checkIn, error } = await client
        .from('check_ins')
        .insert({
          place_name: input.placeName,
          address: input.address ?? null,
          latitude: input.lat,
          longitude: input.lng,
          note: input.note?.trim() || null,
          visited_at: input.visitedAt,
          image_url: imagePath,
        })
        .select('id')
        .single();

      if (error || !checkIn) {
        throw error ?? new Error('Check in was not created');
      }

      checkInId = checkIn.id;

      const moodRows = input.moods.map((mood) => ({
        check_in_id: checkIn.id,
        mood,
      }));

      const drinkRows = input.drinks.map((drink) => ({
        check_in_id: checkIn.id,
        drink,
      }));

      if (moodRows.length) {
        const { error: moodError } = await client
          .from('check_in_moods')
          .insert(moodRows);
        if (moodError) throw moodError;
      }
      if (drinkRows.length) {
        const { error: drinkError } = await client
          .from('check_in_drinks')
          .insert(drinkRows);
        if (drinkError) throw drinkError;
      }
      return checkIn.id;
    } catch (err) {
      if (checkInId) {
        await client.from('check_ins').delete().eq('id', checkInId);
      }
      if (imagePath) {
        await client.storage.from(PHOTO_BUCKET).remove([imagePath]);
      }
      throw err;
    }
  }

  private async uploadPhoto(photo: Blob): Promise<string> {
    const client = this.supabaseService.client;

    const { data: userData } = await client.auth.getUser();
    if (!userData.user) throw new Error('Not logged in');

    const path = `${userData.user.id}/${crypto.randomUUID()}.jpg`;

    const { error } = await client.storage
      .from(PHOTO_BUCKET)
      .upload(path, photo, { contentType: photo.type || 'image/jpeg' });
    
      if (error) throw error;

    return path;
  }
}
