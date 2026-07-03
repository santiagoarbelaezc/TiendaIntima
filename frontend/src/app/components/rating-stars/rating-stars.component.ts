import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-stars.component.html',
  styleUrl: './rating-stars.component.scss'
})
export class RatingStarsComponent {
  @Input() rating = 0;
  @Input() reviewCount = 0;
  @Input() compact = false;

  protected readonly totalStars = 5;

  get stars(): boolean[] {
    return Array.from({ length: this.totalStars }, (_, index) => index < Math.round(this.rating));
  }
}