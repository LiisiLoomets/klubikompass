import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonInput,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '@app/components/header/header.component';
import { UserLocationService } from '@app/core/services/user-location';
import { PlacesService } from '@app/core/services/places';
import { Place } from '@app/models/places.model';

interface SelectedPlace {
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

interface Chip {
  label: string;
  icon?: string; 
}

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.page.html',
  styleUrls: ['./check-in.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonInput,
    CommonModule,
    FormsModule,
    HeaderComponent,
  ],
})
export class CheckInPage implements OnInit {
  places: Place[] = [];
  searchQuery = '';
  showResults = false;
  selectedPlace: SelectedPlace | null = null;

  today = new Date().toLocaleDateString('sv-SE');
  date = this.today;

  readonly moodPresets: Chip[] = [
    { label: 'Rõõmus', icon: 'fa-regular fa-face-grin' },
    { label: 'Chill', icon: 'fa-regular fa-hand-peace' },
    { label: 'Naljakas', icon: 'fa-regular fa-face-grin-tongue-squint' },
  ];

  readonly drinkPresets: Chip[] = [
    { label: 'Longero', icon: 'fa-solid fa-glass-water' },
    { label: 'Õlu', icon: 'fa-solid fa-beer-mug-empty' },
    { label: 'Vein', icon: 'fa-solid fa-wine-glass' },
  ];
  selectedMoods = new Set<string>();
  selectedDrinks = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private userLocationService: UserLocationService,
    private placesService: PlacesService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const name = params.get('placeName');
      if (!name) return;

      this.selectedPlace = {
        name,
        address: params.get('address') ?? undefined,
        lat: Number(params.get('lat')),
        lng: Number(params.get('lng')),
      };
      this.searchQuery = name;
      this.showResults = false;
    });

    this.loadPlaces();
  }

  private async loadPlaces() {
    try {
      const position = await this.userLocationService.getCurrentPosition();
      this.places = await this.placesService.getPlaces(
        position.coords.latitude,
        position.coords.longitude,
      );
    } catch (err) {
      console.error('Failed to load places for check-in:', err);
    }
  }

  get filteredPlaces(): Place[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return [];

    return this.places
      .filter((place) => place.name.toLowerCase().includes(query))
      .slice(0, 8);
  }

  onSearchChange(value: string | null | undefined) {
    this.searchQuery = value ?? '';
    this.showResults = true;

    if (this.selectedPlace && this.searchQuery !== this.selectedPlace.name) {
      this.selectedPlace = null;
    }
  }

  selectPlace(place: Place) {
    this.selectedPlace = {
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
    };
    this.searchQuery = place.name;
    this.showResults = false;
  }

  toggleMood(mood: string) {
    this.toggle(this.selectedMoods, mood);
  }

  toggleDrink(drink: string) {
    this.toggle(this.selectedDrinks, drink);
  }

  private toggle(set: Set<string>, value: string) {
    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }
  }
}
