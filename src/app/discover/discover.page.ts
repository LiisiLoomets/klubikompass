import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '@app/components/header/header.component';
import * as L from 'leaflet';
import { UserLocationService } from '@app/core/services/user-location';
import { PlacesService } from '@app/core/services/places';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeaderComponent],
})
export class DiscoverPage implements AfterViewInit {
  private map!: L.Map;
  constructor(
    private userLocationService: UserLocationService,
    private placesService: PlacesService,
  ) {}

  async ngAfterViewInit() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });

    const [lat, lng] = await this.userLocationService.getCurrentPosition();

    this.map = L.map('map').setView([lat, lng], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map).bindPopup('Sinu asukoht');

    L.circle([lat, lng], {
      radius: 2000,
    }).addTo(this.map);

    const places = await this.placesService.getPlaces(lat, lng);

    places.forEach((place) => {
      L.marker([place.lat, place.lng]).addTo(this.map).bindPopup(`
        <strong>${place.name}</strong><br>
        ${place.type}
      `);
    });
    
  }
}
