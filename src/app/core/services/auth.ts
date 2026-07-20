import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async register(email: string, password: string) {
    return this.supabaseService.client.auth.signUp({ email, password });
  }

  async login(email: string, password: string) {
    return this.supabaseService.client.auth.signInWithPassword({
      email,
      password,
    });
  }

  async logout() {
    return this.supabaseService.client.auth.signOut();
  }

  async getSession() {
    return this.supabaseService.client.auth.getSession();
  }

  getUser() {
    return this.supabaseService.client.auth.getUser();
  }
}
