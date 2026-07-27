import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonInput,
  IonText,
  IonButton,
} from '@ionic/angular/standalone';
import { AuthService } from '@app/core/services/auth';
import { SupabaseService } from '@app/core/services/supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonItem,
    IonInput,
    IonText,
    IonButton,
  ],
})
export class RegisterPage {
  email = '';
  password = '';
  confirmPassword = '';
  username = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private router: Router,
  ) {}

  private isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_]+$/.test(username);
  }

  private isValidPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }

  async onRegister() {
    this.errorMessage = '';

    if (
      !this.email ||
      !this.password ||
      !this.confirmPassword ||
      !this.username
    ) {
      this.errorMessage = 'Palun täida kõik väljad';
      return;
    }

    if (this.username.length < 3 || this.username.length > 20) {
      this.errorMessage = 'Kasutajanimi peab olema 3–20 tähemärki pikk';
      return;
    }

    if (!this.isValidUsername(this.username)) {
      this.errorMessage =
        'Kasutajanimi tohib sisaldada ainult tähti, numbreid ja alakriipse';
      return;
    }

    if (!this.isValidPassword(this.password)) {
      this.errorMessage =
        'Parool peab olema vähemalt 8 tähemärki ning sisaldama suur- ja väiketähte ning numbrit';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Paroolid ei kattu';
      return;
    }

    this.loading = true;

    const { data: existingUser } = await this.supabaseService.client
      .from('users')
      .select('id')
      .eq('username', this.username)
      .maybeSingle();

    if (existingUser) {
      this.loading = false;
      this.errorMessage = 'Kasutajanimi on juba kasutusel';
      return;
    }

    const { data, error } = await this.authService.register(
      this.email,
      this.password,
    );

    if (error || !data.user) {
      this.loading = false;
      this.errorMessage = 'Registreerimine ebaõnnestus. Proovi uuesti.';
      return;
    }

    const { error: profileError } = await this.supabaseService.client
      .from('users')
      .insert({
        id: data.user.id,
        username: this.username,
      });

    this.loading = false;

    if (profileError) {
      if (profileError.code === '23505') {
        this.errorMessage = 'Kasutajanimi on juba kasutusel';
      } else {
        this.errorMessage =
          'Konto loodi, kuid profiili salvestamine ebaõnnestus.';
      }
      return;
    }

    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
