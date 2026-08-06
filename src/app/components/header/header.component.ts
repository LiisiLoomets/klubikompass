import { Component, Input } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton],
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() showLogo: boolean = false;
}
