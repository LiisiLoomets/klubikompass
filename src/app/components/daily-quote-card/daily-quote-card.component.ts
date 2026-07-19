import { Component, OnInit } from '@angular/core';
import { QuoteService } from '@services/quote';
import { SupabaseService } from '@services/supabase';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-daily-quote-card',
  templateUrl: './daily-quote-card.component.html',
  styleUrls: ['./daily-quote-card.component.scss'],
  imports: [CardComponent],
})
export class DailyQuoteCardComponent implements OnInit {
  constructor(
    private supabaseService: SupabaseService,
    private quoteService: QuoteService,
  ) {}

  dailyQuote: any;

  async ngOnInit() {
    const quotes = await this.quoteService.getDailyQuote();

    if (!quotes || quotes.length == 0) return;

    const today = new Date();
    const index =
      Number(
        `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`,
      ) % quotes.length;

    this.dailyQuote = quotes[index];
    //console.log('DAILY QUOTE:', this.dailyQuote);
  }
}
