import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';

import { topBarMessages } from '../../core/constants/brand.constants';

@Component({
  selector: 'app-top-bar-promocional',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-bar-promocional.component.html',
  styleUrl: './top-bar-promocional.component.scss'
})
export class TopBarPromocionalComponent implements OnInit, OnDestroy {
  readonly message = signal(topBarMessages[0]);
  private timerId: number | null = null;
  private index = 0;

  ngOnInit(): void {
    this.timerId = window.setInterval(() => {
      this.index = (this.index + 1) % topBarMessages.length;
      this.message.set(topBarMessages[this.index]);
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }
  }
}