import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
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
export class HeroComponent implements AfterViewInit, OnDestroy {
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
  private autoplayInterval?: ReturnType<typeof setInterval>;
  private readonly AUTOPLAY_DELAY = 4500;

  ngAfterViewInit(): void {
    this.syncCurrentSlide();
    this.startAutoplay();

    // Prevent vertical wheel scroll from moving the horizontal carousel
    const container = this.scrollContainer?.nativeElement;
    if (container) {
      container.addEventListener('wheel', this.onWheel, { passive: false });
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    const container = this.scrollContainer?.nativeElement;
    if (container) {
      container.removeEventListener('wheel', this.onWheel);
    }
  }

  readonly onWheel = (event: WheelEvent): void => {
    // If the scroll is primarily vertical, prevent the carousel from moving
    // and redirect the scroll to the page instead
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      window.scrollBy({ top: event.deltaY, behavior: 'auto' });
    }
  };

  scrollToSlide(index: number): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const slideWidth = container.clientWidth;
    container.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
    this.currentSlide = index;
    // Restart autoplay on manual navigation
    this.startAutoplay();
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

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      const next = (this.currentSlide + 1) % this.items.length;
      this.scrollToSlide(next);
    }, this.AUTOPLAY_DELAY);
  }

  private stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }
}