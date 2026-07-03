import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type BadgeTone = 'default' | 'accent' | 'dark';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  @Input() label = '';
  @Input() tone: BadgeTone = 'default';

  get toneClasses(): string {
    const baseClasses = 'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]';

    if (this.tone === 'accent') {
      return `${baseClasses} bg-[#EAC7D2] text-[#111111]`;
    }

    if (this.tone === 'dark') {
      return `${baseClasses} bg-[#111111] text-white`;
    }

    return `${baseClasses} bg-white text-[#111111] ring-1 ring-black/10`;
  }
}