import { Component, OnInit } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-recommended-place-card',
  templateUrl: './recommended-place-card.component.html',
  styleUrls: ['./recommended-place-card.component.scss'],
  imports: [
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
  ],
})
export class RecommendedPlaceCardComponent {
  place = {
    name: "Hall",
    type: "Klubi",
    aadress: "Peetri 6"
  };

}
