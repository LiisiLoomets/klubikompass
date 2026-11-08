import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonInput,
  IonTextarea,
  ToastController,
  IonText,
  IonButton,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { Camera } from '@capacitor/camera';
import { HeaderComponent } from '@app/components/header/header.component';
import { UserLocationService } from '@app/core/services/user-location';
import { PlacesService } from '@app/core/services/places';
import { CheckInService } from '@app/core/services/check-in';
import { Place } from '@app/models/places.model';
import { compressImage } from '@app/core/utils/image';

interface SelectedPlace {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  isCustom?: boolean;
}

interface Chip {
  label: string;
  icon?: string;
}

type ChipGroup = 'mood' | 'drink';

const MOOD_PRESETS: Chip[] = [
  { label: 'Rõõmus', icon: 'fa-regular fa-face-grin' },
  { label: 'Chill', icon: 'fa-regular fa-hand-peace' },
  { label: 'Naljakas', icon: 'fa-regular fa-face-grin-tongue-squint' },
];

const DRINK_PRESETS: Chip[] = [
  { label: 'Longero', icon: 'fa-solid fa-glass-water' },
  { label: 'Õlu', icon: 'fa-solid fa-beer-mug-empty' },
  { label: 'Vein', icon: 'fa-solid fa-wine-glass' },
];

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

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
    IonTextarea,
    IonText,
    IonButton,
  ],
})
export class CheckInPage implements OnInit {
  @ViewChild('chipInput') chipInput?: ElementRef<HTMLInputElement>;

  places: Place[] = [];
  searchQuery = '';
  showResults = false;
  selectedPlace: SelectedPlace | null = null;
  customAddress = '';

  today = new Date().toLocaleDateString('sv-SE');
  date = this.today;

  moodChips: Chip[] = [...MOOD_PRESETS];
  drinkChips: Chip[] = [...DRINK_PRESETS];

  selectedMoods = new Set<string>();
  selectedDrinks = new Set<string>();

  note = '';

  photoBlob: Blob | null = null;
  photoPreview: string | null = null;

  addingGroup: ChipGroup | null = null;
  newChipText = '';

  saving = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private userLocationService: UserLocationService,
    private placesService: PlacesService,
    private checkInService: CheckInService,
    private actionSheetController: ActionSheetController,
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

  get canAddCustomPlace(): boolean {
    if (this.selectedPlace) return false;

    const query = this.normalizePlaceName(this.searchQuery);
    if (query.length < 2) return false;

    return !this.places.some(
      (place) => place.name.toLocaleLowerCase() === query.toLowerCase(),
    );
  }

  selectCustomPlace() {
    const name = this.normalizePlaceName(this.searchQuery);
    if (name.length < 2) return;

    this.selectedPlace = { name, isCustom: true };
    this.customAddress = '';
    this.searchQuery = name;
    this.showResults = false;
  }

  private normalizePlaceName(text: string): string {
    return text.trim().replace(/\s+/g, ' ').slice(0, 80);
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

  startAdding(group: ChipGroup) {
    this.addingGroup = group;
    this.newChipText = '';

    setTimeout(() => this.chipInput?.nativeElement.focus());
  }

  cancelAdding() {
    this.addingGroup = null;
    this.newChipText = '';
  }

  confirmAdding() {
    const group = this.addingGroup;
    if (!group) return;

    const label = this.normalizeLabel(this.newChipText);
    if (!label) {
      this.cancelAdding();
      return;
    }

    const chips = group === 'mood' ? this.moodChips : this.drinkChips;
    const selected =
      group === 'mood' ? this.selectedMoods : this.selectedDrinks;

    const existing = chips.find(
      (chip) => chip.label.toLowerCase() === label.toLowerCase(),
    );

    if (existing) {
      selected.add(existing.label);
    } else {
      chips.push({ label });
      selected.add(label);
    }

    this.cancelAdding();
  }

  private normalizeLabel(text: string): string {
    const clean = text.trim().replace(/\s+/g, ' ');
    if (!clean) return '';
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }

  async pickPhoto() {
    const sheet = await this.actionSheetController.create({
      header: 'Lisa pilt',
      buttons: [
        { text: 'Tee pilt', data: { source: 'camera' } },
        { text: 'Vali galeriist', data: { source: 'gallery' } },
        { text: 'Tühista', role: 'cancel' },
      ],
    });
    await sheet.present();

    const { data } = await sheet.onDidDismiss();
    if (!data?.source) return;

    try {
      const options = {
        quality: 70,
        targetWidth: 1280,
        targetHeight: 1280,
        editable: 'in-app' as const,
      };

      const result =
        data.source === 'camera'
          ? await Camera.takePhoto(options)
          : (await Camera.chooseFromGallery(options)).results[0];

      if (!result?.webPath) return;

      const response = await fetch(result.webPath);
      const blob = await compressImage(await response.blob());

      if (blob.size > MAX_PHOTO_BYTES) {
        this.errorMessage = 'Pilt liiga suur (max 5 MB)';
        return;
      }

      this.removePhoto();
      this.photoBlob = blob;
      this.photoPreview = URL.createObjectURL(blob);
      this.errorMessage = '';
    } catch (err: any) {
      if (this.isCancelled(err)) return;

      console.error('Photo failed: ', err);
      this.errorMessage = 'Pildi lisamine ebaõnnestus';
    }
  }

  private isCancelled(err: any): boolean {
    const code = err?.code;
    return (
      code === 'OS-PLUG-CAMR-0006' ||
      code === 'OS-PLUG-CAMR-0020' ||
      String(err?.message ?? '')
        .toLowerCase()
        .includes('cancel')
    );
  }

  removePhoto() {
    if (this.photoPreview) URL.revokeObjectURL(this.photoPreview);
    this.photoBlob = null;
    this.photoPreview = null;
  }

  async onSave() {
    this.errorMessage = '';

    const place = this.selectedPlace;

    if (!place) {
      this.errorMessage = 'Vali koht';
      return;
    }

    if (!this.date) {
      this.errorMessage = 'Vali kuupäev';
      return;
    }

    this.saving = true;

    try {
      await this.checkInService.createCheckIn({
        placeName: place.name,
        address: place.isCustom
          ? this.customAddress.trim() || undefined
          : place.address,
        lat: place.lat,
        lng: place.lng,
        note: this.note,
        visitedAt: this.date,
        moods: [...this.selectedMoods],
        drinks: [...this.selectedDrinks],
        photo: this.photoBlob ?? undefined,
      });

      this.resetForm();

      this.router.navigate(['/tabs/check-in'], { replaceUrl: true });

      const toast = await this.toastController.create({
        message: 'Check-in salvestatud',
        duration: 2000,
        position: 'bottom',
      });
      await toast.present();
    } catch (err) {
      console.error('Failed to save check-in: ', err);
      this.errorMessage = 'Salvestamine ebaõnnestus. Proovi uuesti.';
    } finally {
      this.saving = false;
    }
  }

  private resetForm() {
    this.selectedPlace = null;
    this.searchQuery = '';
    this.showResults = false;
    this.customAddress = '';

    this.today = new Date().toLocaleDateString('sv-SE');
    this.date = this.today;

    this.moodChips = [...MOOD_PRESETS];
    this.drinkChips = [...DRINK_PRESETS];
    this.selectedMoods.clear();
    this.selectedDrinks.clear();

    this.note = '';
    this.removePhoto();
    this.cancelAdding();
  }
}
