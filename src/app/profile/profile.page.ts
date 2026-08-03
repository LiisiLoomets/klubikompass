import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { HeaderComponent } from '@app/components/header/header.component';
import { AuthService } from '@app/core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, CommonModule, FormsModule, HeaderComponent],
})
export class ProfilePage {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async onLogout() {
    await this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
