import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonTitle } from '@ionic/angular/standalone';
import { HeaderComponent } from '@app/components/header/header.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeaderComponent, IonTitle],
})
export class ProfilePage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
