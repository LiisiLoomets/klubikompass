import { Component, OnInit } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-recommended-place-card',
  templateUrl: './recommended-place-card.component.html',
  styleUrls: ['./recommended-place-card.component.scss'],
  imports: [IonButton, CardComponent],
})
export class RecommendedPlaceCardComponent {
  place = {
    name: 'Hall',
    type: 'Klubi',
    aadress: 'Peetri 6',
  };
}
