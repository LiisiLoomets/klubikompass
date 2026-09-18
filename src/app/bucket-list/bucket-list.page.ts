import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@app/components/header/header.component';
import { BucketListService } from '@app/core/services/bucket-list';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

interface BucketListItem {
  id: string;
  place_name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

@Component({
  selector: 'app-bucket-list',
  templateUrl: './bucket-list.page.html',
  styleUrls: ['./bucket-list.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
})
export class BucketListPage {
  items: BucketListItem[] = [];
  loading = true;

  constructor(
    private bucketListService: BucketListService,
    private router: Router,
  ) {
    addIcons({ trashOutline });
  }

  ionViewWillEnter() {
    this.loadItems();
  }

  async loadItems() {
    this.loading = true;
    this.items = await this.bucketListService.getBucketList();
    this.loading = false;
  }

  async removeItem(id: string) {
    await this.bucketListService.removeFromBucketList(id);
    this.items = this.items.filter((item) => item.id !== id);
  }

  goToCheckIn(item: BucketListItem) {
    this.router.navigate(['/check-in'], {
      queryParams: {
        placeName: item.place_name,
        address: item.address,
        lat: item.latitude,
        lng: item.longitude,
      },
    });
  }
}
