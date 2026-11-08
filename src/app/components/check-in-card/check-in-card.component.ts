import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CheckInPost } from '@app/models/check-in.model';

@Component({
  selector: 'app-check-in-card',
  templateUrl: './check-in-card.component.html',
  styleUrls: ['./check-in-card.component.scss'],
  standalone: true,
  imports: [DatePipe],
})
export class CheckInCardComponent {
  @Input({ required: true }) checkIn!: CheckInPost;
}
