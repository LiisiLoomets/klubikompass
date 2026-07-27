import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonItem, IonText, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '@app/core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonItem,
    IonInput,
    IonText,
    IonButton
],
})
export class LoginPage {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Palun täida kõik väljad';
      return;
    }

    this.loading = true;

    const { error } = await this.authService.login(this.email, this.password);

    this.loading = false;

    if (error) {
      this.errorMessage = 'Vale e-post või parool';
      return;
    }

    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }
}
