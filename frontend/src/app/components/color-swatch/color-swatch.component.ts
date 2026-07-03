import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import type { ColorOpcion } from '../../models/producto';

@Component({
  selector: 'app-color-swatch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-swatch.component.html',
  styleUrl: './color-swatch.component.scss'
})
export class ColorSwatchComponent {
  @Input() colors: ColorOpcion[] = [];
  @Input() selected?: ColorOpcion;
  @Output() selectedChange = new EventEmitter<ColorOpcion>();

  selectColor(color: ColorOpcion): void {
    this.selected = color;
    this.selectedChange.emit(color);
  }
}