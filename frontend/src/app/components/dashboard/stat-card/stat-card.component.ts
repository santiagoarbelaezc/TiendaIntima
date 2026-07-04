import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html'
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number | null | undefined;
  @Input() delta?: number; // porcentaje positivo o negativo
  @Input() prefix?: string;
  @Input() suffix?: string;
  @Input() iconPath?: string;

  readonly Math = Math;
}
