import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Categoria } from '../../models/categoria';

@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mega-menu.component.html',
  styleUrl: './mega-menu.component.scss'
})
export class MegaMenuComponent {
  @Input() categories: Categoria[] = [];
  @Input() activeSlug = '';
  @Output() itemClick = new EventEmitter<void>();

  get highlightImage(): string {
    const activeCategory = this.categories.find((category) => category.slug === this.activeSlug);
    return activeCategory?.imagen ?? this.categories[0]?.imagen ?? '';
  }
}