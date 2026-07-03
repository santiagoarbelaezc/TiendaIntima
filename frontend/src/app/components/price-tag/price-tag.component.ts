import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-price-tag',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './price-tag.component.html',
  styleUrl: './price-tag.component.scss'
})
export class PriceTagComponent {
  @Input() price = 0;
  @Input() previousPrice?: number;
}