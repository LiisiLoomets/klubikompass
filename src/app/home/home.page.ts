import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '@app/components/header/header.component';
import { RecommendedPlaceCardComponent } from '@app/components/recommended-place-card/recommended-place-card.component';
import { DailyQuoteCardComponent } from '@app/components/daily-quote-card/daily-quote-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    RecommendedPlaceCardComponent,
    DailyQuoteCardComponent,
  ],
})
export class HomePage implements OnInit {
  async ngOnInit() {}
}
