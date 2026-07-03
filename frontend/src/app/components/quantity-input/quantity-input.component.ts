import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-quantity-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quantity-input.component.html',
  styleUrl: './quantity-input.component.scss'
})
export class QuantityInputComponent {
  @Input() value = 1;
  @Input() min = 1;
  @Input() max = 99;
  @Output() valueChange = new EventEmitter<number>();

  decrease(): void {
    this.setValue(this.value - 1);
  }

  increase(): void {
    this.setValue(this.value + 1);
  }

  private setValue(nextValue: number): void {
    const clampedValue = Math.min(this.max, Math.max(this.min, nextValue));
    this.value = clampedValue;
    this.valueChange.emit(clampedValue);
  }
}