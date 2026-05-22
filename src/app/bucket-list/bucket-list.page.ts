import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonTitle } from '@ionic/angular/standalone';
import { HeaderComponent } from '@app/components/header/header.component';

@Component({
  selector: 'app-bucket-list',
  templateUrl: './bucket-list.page.html',
  styleUrls: ['./bucket-list.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeaderComponent, IonTitle],
})
export class BucketListPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
