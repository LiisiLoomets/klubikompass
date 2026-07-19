import { Component, Input, OnInit } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardContent],
})
export class CardComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() titleColor: string = 'var(--ion-text-color)';
}
