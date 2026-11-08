import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { HeaderComponent } from '@app/components/header/header.component';
import { CheckInCardComponent } from '@app/components/check-in-card/check-in-card.component';
import { AuthService } from '@app/core/services/auth';
import { CheckInService, MyStats } from '@app/core/services/check-in';
import { ProfileService } from '@app/core/services/profile';
import { CheckInPost } from '@app/models/check-in.model';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonSpinner,
    HeaderComponent,
    CheckInCardComponent,
  ],
})
export class ProfilePage {
  username = '';
  stats: MyStats = { total: 0, distinctPlaces: 0, thisMonth: 0, topPlaces: [] };
  checkIns: CheckInPost[] = [];

  loading = true;
  loadingMore = false;
  hasMore = false;
  errorMessage = '';

  private page = 0;
  private loadedOnce = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private checkInService: CheckInService,
    private profileService: ProfileService,
  ) {}

  ionViewWillEnter() {
    this.load();
  }

  private async load() {
    if (!this.loadedOnce) this.loading = true;
    this.errorMessage = '';
    this.page = 0;

    try {
      const [username, stats, checkIns] = await Promise.all([
        this.profileService.getMyUsername(),
        this.checkInService.getMyStats(),
        this.checkInService.getMyCheckIns(0, PAGE_SIZE),
      ]);

      this.username = username;
      this.stats = stats;
      this.checkIns = checkIns;
      this.hasMore = checkIns.length === PAGE_SIZE;
      this.loadedOnce = true;
    } catch (err) {
      console.error('Failed to load profile:', err);
      this.errorMessage = 'Profiili laadimine ebaõnnestus';
    } finally {
      this.loading = false;
    }
  }

  async loadMore() {
    if (this.loadingMore) return;
    this.loadingMore = true;

    try {
      const next = await this.checkInService.getMyCheckIns(
        this.page + 1,
        PAGE_SIZE,
      );
      this.page++;
      this.checkIns = [...this.checkIns, ...next];
      this.hasMore = next.length === PAGE_SIZE;
    } catch (err) {
      console.error('Failed to load more check-ins:', err);
    } finally {
      this.loadingMore = false;
    }
  }

  async onLogout() {
    await this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
