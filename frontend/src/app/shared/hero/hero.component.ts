import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../components/button/button.component';

export interface HeroImageItem {
  img: string;
  title: string;
  subtitle: string;
  link: string;
  ctaText: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  readonly items: HeroImageItem[] = [
    {
      img: 'assets/images/pijamas-hero.png',
      title: 'Pijamas suaves',
      subtitle: 'Siluetas relajadas para noches tranquilas.',
      link: '/catalogo?categoria=pijamas',
      ctaText: 'Ver pijamas'
    },
    {
      img: 'assets/images/ropa-interior-hero.png',
      title: 'Ropa interior',
      subtitle: 'Piezas delicadas con ajuste cómodo.',
      link: '/catalogo?categoria=ropa-interior',
      ctaText: 'Ver ropa interior'
    },
    {
      img: 'assets/images/novedades-hero.png',
      title: 'Novedades',
      subtitle: 'Texturas nuevas para renovar tu armario.',
      link: '/catalogo?filter=nuevo',
      ctaText: 'Descubrir novedades'
    }
  ];

  currentSlide = 0;

  ngAfterViewInit(): void {
    this.syncCurrentSlide();
  }

  scrollToSlide(index: number): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const slideWidth = container.clientWidth;
    container.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
    this.currentSlide = index;
  }

  onScroll(): void {
    this.syncCurrentSlide();
  }

  private syncCurrentSlide(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const slideWidth = container.clientWidth || 1;
    this.currentSlide = Math.round(container.scrollLeft / slideWidth);
  }
}