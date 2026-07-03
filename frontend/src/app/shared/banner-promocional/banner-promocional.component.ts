import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner-promocional',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-promocional.component.html',
  styleUrl: './banner-promocional.component.scss'
})
export class BannerPromocionalComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() image = '';
}