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
      title: 'Pijamas & Descanso',
      subtitle: 'Suavidad y confort en tu hogar.',
      description: 'Prendas en algodón y satén pensadas para tu descanso diario.',
      promoTag: 'COLECCIÓN HOGAR',
      promoText: 'Envíos a domicilio solo en Calarcá, Quindío',
      promoIcon: 'shipping',
      link: '/catalogo?categoria=pijamas',
      ctaText: 'Ver Pijamas'
    },
    {
      img: 'assets/images/hero_interior_1.png',
      img2: 'assets/images/hero_interior_2.png',
      title: 'Ropa Interior',
      subtitle: 'Comodidad y ajuste natural.',
      description: 'Prendas suaves y frescas para acompañar tu día a día.',
      promoTag: 'LÍNEA ÍNTIMA',
      promoText: 'Envíos a domicilio solo en Calarcá, Quindío',
      promoIcon: 'shipping',
      link: '/catalogo?categoria=ropa-interior',
      ctaText: 'Ver Colección'
    },
    {
      img: 'assets/images/hero_novedades_1.png',
      img2: 'assets/images/hero_novedades_2.png',
      title: 'Batas & Sets',
      subtitle: 'Detalles que inspiran calma.',
      description: 'Diseños ligeros y suaves para tus momentos de descanso.',
      promoTag: 'NUEVA TEMPORADA',
      promoText: 'Envíos a domicilio solo en Calarcá, Quindío',
      promoIcon: 'shipping',
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