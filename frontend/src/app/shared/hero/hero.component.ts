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
      img: 'assets/images/hero_pijamas_1.png',
      img2: 'assets/images/hero_pijamas_2.png',
      title: 'Momento de Descanso',
      subtitle: 'Suavidad y calidez para tu hogar.',
      description: 'Disfruta tus mañanas y noches con nuestras pijamas de algodón nublado y satén. Diseñadas para abrazar tu tranquilidad y bienestar en familia.',
      promoTag: 'COLECCIÓN HOGAR & PIJAMAS',
      promoText: 'Envío gratis a toda Colombia en pedidos mayores a $150.000',
      promoIcon: 'shipping',
      link: '/catalogo?categoria=pijamas',
      ctaText: 'Ver Pijamas'
    },
    {
      img: 'assets/images/hero_interior_1.png',
      img2: 'assets/images/hero_interior_2.png',
      title: 'Suavidad Cotidiana',
      subtitle: 'Comodidad natural y ajuste impecable.',
      description: 'Prendas íntimas con tejidos suaves y transpirables pensadas para tu ritmo diario. Menos costuras molestas, más libertad de movimiento.',
      promoTag: 'ROPA INTERIOR CÓMODA',
      promoText: '10% OFF en tu primera compra con el código INTIMA10',
      promoIcon: 'discount',
      link: '/catalogo?categoria=ropa-interior',
      ctaText: 'Explorar Colección'
    },
    {
      img: 'assets/images/hero_novedades_1.png',
      img2: 'assets/images/hero_novedades_2.png',
      title: 'Tu Espacio de Paz',
      subtitle: 'Armonía y detalles que enamoran.',
      description: 'Conoce nuestras nuevas batas florales y conjuntos de descanso para compartir un café por la mañana o relajarte al final del día.',
      promoTag: 'NOVEDADES DE TEMPORADA',
      promoText: 'Empaque de regalo exclusivo de cortesía en todas tus órdenes',
      promoIcon: 'gift',
      link: '/galeria',
      ctaText: 'Ver Galería'
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