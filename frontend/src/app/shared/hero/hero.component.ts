import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../components/button/button.component';

export interface HeroImageItem {
  img: string;
  img2: string;
  title: string;
  subtitle: string;
  description: string;
  promoTag: string;
  promoText: string;
  promoIcon: string;
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
      img2: 'assets/images/pijamas-hero-2.png',
      title: 'Noches de Satén',
      subtitle: 'Siluetas fluidas y sofisticadas.',
      description: 'Lujo sutil y máxima suavidad para tus momentos de descanso. Diseños delicados creados en satén premium que acarician tu piel.',
      promoTag: 'EDICIÓN EXCLUSIVA',
      promoText: 'Envío gratis por compras superiores a $150.000',
      promoIcon: 'shipping',
      link: '/catalogo?categoria=pijamas',
      ctaText: 'Explorar Colección'
    },
    {
      img: 'assets/images/ropa-interior-hero.png',
      img2: 'assets/images/ropa-interior-hero-2.png',
      title: 'Seducción Encaje',
      subtitle: 'Detalles de tirantes y transparencias.',
      description: 'Siente la sensualidad del encaje premium con designs provocativos, sensuales y un ajuste perfecto que destaca tu silueta única.',
      promoTag: 'NUEVA COLECCIÓN LINGERIE',
      promoText: '10% OFF extra en tu primer pedido con el código INTTIMA10',
      promoIcon: 'discount',
      link: '/catalogo?categoria=ropa-interior',
      ctaText: 'Ver Diseños'
    },
    {
      img: 'assets/images/novedades-hero-2.png', // Rotado: antes novedades-hero
      img2: 'assets/images/novedades-hero.png',   // Rotado: antes novedades-hero-2
      title: 'Detalles Únicos',
      subtitle: 'La combinación perfecta de erotismo y elegancia.',
      description: 'Prendas con tiras cruzadas, arneses y aberturas sugerentes diseñadas para sorprender y disfrutar de tu sensualidad sin límites.',
      promoTag: 'NOVEDADES HOT',
      promoText: 'Empaque de lujo discreto en todas tus compras',
      promoIcon: 'gift',
      link: '/catalogo?filter=nuevo',
      ctaText: 'Ver Novedades'
    }
  ];




  currentSlide = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;
  private readonly AUTOPLAY_DELAY = 4500;

  ngAfterViewInit(): void {
    this.syncCurrentSlide();
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

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