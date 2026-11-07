import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface NewCheckIn {
  placeName: string;
  address?: string;
  lat: number;
  lng: number;
  note?: string;
  visitedAt: string;
  moods: string[];
  drinks: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CheckInService {
  constructor(private supabaseService: SupabaseService) {}

  async createCheckIn(input: NewCheckIn) {
    const client = this.supabaseService.client;

    const { data: checkin, error } = await client
      .from('check_ins')
      .insert({
        place_name: input.placeName,
        address: input.address ?? null,
        latitude: input.lat,
        longitude: input.lng,
        note: input.note?.trim() || null,
        visited_at: input.visitedAt,
      })
      .select('id')
      .single();

    if (error || !checkin) {
      throw error ?? new Error('Check in was not created');
    }

    const moodRows = input.moods.map((mood) => ({
      check_in_id: checkin.id,
      mood
    }));

    const drinkRows = input.drinks.map((drink) => ({
      check_in_id: checkin.id,
      drink
    }));

    try {
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
    } catch (err) {
      await client.from('check_ins').delete().eq('id', checkin.id);
      throw err;
    }
    return checkin.id;
  }
}
