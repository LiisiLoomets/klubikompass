import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { CheckInPost } from '@app/models/check-in.model';

const PHOTO_BUCKET = 'check-in-photos';
const PHOTO_URL_SECONDS = 60 * 60;

export interface NewCheckIn {
  placeName: string;
  address?: string;
  lat?: number;
  lng?: number;
  note?: string;
  visitedAt: string;
  moods: string[];
  drinks: string[];
  photo?: Blob;
}

export interface MyStats {
  total: number;
  distinctPlaces: number;
  thisMonth: number;
  topPlaces: { name: string; count: number }[];
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
          latitude: input.lat ?? null,
          longitude: input.lng ?? null,
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

  async getMyStats(): Promise<MyStats> {
    const userId = await this.getUserId();

    const { data, error } = await this.supabaseService.client
      .from('check_ins')
      .select('place_name, latitude, longitude, visited_at')
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    const rows = data ?? [];
    const month = new Date().toLocaleDateString('sv-SE').slice(0, 7);

    const places = new Map<string, { name: string; count: number }>();
    let thisMonth = 0;

    for (const row of rows) {
      if (row.visited_at?.startsWith(month)) thisMonth++;

      const key =
        row.latitude != null && row.longitude != null
          ? `${row.latitude},${row.longitude}`
          : `name:${row.place_name.toLowerCase()}`;

      const entry = places.get(key);
      if (entry) {
        entry.count++;
      } else {
        places.set(key, { name: row.place_name, count: 1 });
      }
    }

    return {
      total: rows.length,
      distinctPlaces: places.size,
      thisMonth,
      topPlaces: [...places.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    };
  }

  async getMyCheckIns(page = 0, pageSize = 20): Promise<CheckInPost[]> {
    const client = this.supabaseService.client;
    const userId = await this.getUserId();
    const from = page * pageSize;

    const { data, error } = await client
      .from('check_ins')
      .select(
        'id, place_name, address, note, visited_at, created_at, image_url, check_in_moods(mood), check_in_drinks(drink)',
      )
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;

    const rows = (data ?? []) as any[];

    const paths = rows
      .map((row) => row.image_url as string | null)
      .filter((path): path is string => !!path);

    const urlByPath = new Map<string, string>();

    if (paths.length) {
      const { data: signed } = await client.storage
        .from(PHOTO_BUCKET)
        .createSignedUrls(paths, PHOTO_URL_SECONDS);

      signed?.forEach((item) => {
        if (item.path && item.signedUrl) {
          urlByPath.set(item.path, item.signedUrl);
        }
      });
    }

    return rows.map((row) => ({
      id: row.id,
      placeName: row.place_name,
      address: row.address,
      note: row.note,
      visitedAt: row.visited_at,
      createdAt: row.created_at,
      imageUrl: row.image_url ? (urlByPath.get(row.image_url) ?? null) : null,
      moods: (row.check_in_moods ?? []).map((m: any) => m.mood),
      drinks: (row.check_in_drinks ?? []).map((d: any) => d.drink),
    }));
  }

  private async getUserId(): Promise<string> {
    const { data } = await this.supabaseService.client.auth.getUser();
    if (!data.user) throw new Error('Not logged in');
    return data.user.id;
  }

  private async uploadPhoto(photo: Blob): Promise<string> {
    const userId = await this.getUserId();
    const path = `${userId}/${crypto.randomUUID()}.jpg`;

    const { error } = await this.supabaseService.client.storage
      .from(PHOTO_BUCKET)
      .upload(path, photo, { contentType: photo.type || 'image/jpeg' });

    if (error) throw error;

    return path;
  }
}
