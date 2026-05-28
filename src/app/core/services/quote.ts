import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  constructor(private supabase: SupabaseService) {}

  async getDailyQuote() {
    const { data, error } = await this.supabase.client
      .from('daily_quotes')
      .select('text');

    if (error) {
      console.error("ERROR: ", error);
      return null;
    }
    return data;
  }
}
