import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-size-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './size-selector.component.html',
  styleUrl: './size-selector.component.scss'
})
export class SizeSelectorComponent {
  @Input() sizes: string[] = [];
  @Input() selected = '';
  @Output() selectedChange = new EventEmitter<string>();

  selectSize(size: string): void {
    this.selected = size;
    this.selectedChange.emit(size);
  }
}