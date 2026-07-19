import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonSearchbar,
  IonList,
  IonLabel,
  IonNote,
  IonItem,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@app/components/header/header.component';
import * as L from 'leaflet';
import { UserLocationService } from '@app/core/services/user-location';
import { PlacesService } from '@app/core/services/places';
import { Place } from '@app/models/places.model';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonSearchbar,
    IonList,
    IonLabel,
    IonNote,
    IonItem,
  ],
})
export class DiscoverPage implements AfterViewInit {
  private map!: L.Map;
  constructor(
    private userLocationService: UserLocationService,
    private placesService: PlacesService,
  ) {}

  searchQuery = '';
  showResults = true;
  places: Place[] = [];

  get filteredPlaces(): Place[] {
    if (!this.searchQuery.trim()) {
      return this.places;
    }

    return this.places.filter((place) =>
      place.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
  }

  onSearchChange(value: string | null | undefined) {
    this.searchQuery = value ?? '';
    this.showResults = true;
  }

  centerMap(place: Place) {
    this.map.flyTo([place.lat, place.lng], 16, {
      duration: 1.5,
    });

    this.searchQuery = place.name;
    this.showResults = false;
  }

  async ngAfterViewInit() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });

    const position = await this.userLocationService.getCurrentPosition();

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    this.map = L.map('map').setView([lat, lng], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    const userIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.marker([lat, lng], {icon: userIcon}).addTo(this.map).bindPopup('Sinu asukoht');

    L.circle([lat, lng], {
      radius: 2000,
    }).addTo(this.map);

    this.places = await this.placesService.getPlaces(lat, lng);

    this.places.forEach((place) => {
      L.marker([place.lat, place.lng]).addTo(this.map).bindPopup(`
        <strong>${place.name}</strong><br>
        ${place.type}
      `);
    });
  }
}
