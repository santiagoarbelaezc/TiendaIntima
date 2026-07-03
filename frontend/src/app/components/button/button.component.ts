import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;

  get classes(): string {
    const base = 'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200';

    if (this.variant === 'secondary') {
      return `${base} bg-transparent text-[#111111] ring-1 ring-black/10 hover:ring-black/30`;
    }

    if (this.variant === 'ghost') {
      return `${base} bg-transparent text-[#111111] hover:bg-black/5`;
    }

    return `${base} bg-[#111111] text-white hover:bg-[#1f1f1f]`;
  }
}