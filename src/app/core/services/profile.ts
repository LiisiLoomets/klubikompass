import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private supabaseService: SupabaseService) {}

  async getMyUsername(): Promise<string> {
    const client = this.supabaseService.client;

    const { data: userData } = await client.auth.getUser();
    if (!userData.user) return '';

    const { data } = await client
      .from('users')
      .select('username')
      .eq('id', userData.user.id)
      .maybeSingle();

    return data?.username ?? '';
  }
}
