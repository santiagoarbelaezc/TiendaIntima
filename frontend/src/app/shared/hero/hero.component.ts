import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../components/button/button.component';
import { HeroImagesComponent } from '../hero-images/hero-images.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, HeroImagesComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() image = '';
  @Input() ctaLabel = '';
  @Input() ctaLink = '/catalogo';
}