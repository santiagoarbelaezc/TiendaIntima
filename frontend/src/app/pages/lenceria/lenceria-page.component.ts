import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductosService } from '../../services/productos.service';
import type { Producto } from '../../models/producto';

export interface LenceriaSlide {
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
  selector: 'app-lenceria-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './lenceria-page.component.html',
  styleUrl: './lenceria-page.component.scss'
})
export class LenceriaPageComponent implements AfterViewInit, OnDestroy {
  private readonly productosService = inject(ProductosService);
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;
  
  readonly allProducts = toSignal(this.productosService.getProductos(), { initialValue: [] as Producto[] });
  readonly lenceriaProducts = signal<Producto[]>([]);

  readonly carouselItems: LenceriaSlide[] = [
    {
      img: 'assets/images/lenceria-carousel-1.png',
      img2: 'assets/images/lenceria-carousel-2.png',
      title: 'Seducción y Arte',
      subtitle: 'Diseños de encaje fino y arneses.',
      description: 'Siente el poder y la sofisticación de nuestra colección exclusiva de lencería, pensada para celebrar tu sensualidad sin límites.',
      promoTag: 'COLECCIÓN EXCLUSIVA',
      promoText: 'Empaque boutique 100% discreto sin etiquetas de marca',
      promoIcon: 'gift',
      link: '#productos',
      ctaText: 'Explorar Diseños'
    },
    {
      img: 'assets/images/lenceria-carousel-2.png',
      img2: 'assets/images/lenceria-carousel-1.png',
      title: 'Detalles Sutiles',
      subtitle: 'La combinación perfecta de sofisticación y comodidad.',
      description: 'Siluetas provocativas y favorecedoras confeccionadas con texturas selectas para tus momentos más especiales.',
      promoTag: 'EDICIÓN LIMITADA',
      promoText: 'Envío exprés y discreto a todo el país',
      promoIcon: 'shipping',
      link: '#productos',
      ctaText: 'Ver Colección'
    }
  ];

  currentSlide = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;
  private readonly AUTOPLAY_DELAY = 5000;

  constructor() {
    effect(() => {
      const filtered = this.allProducts().filter(
        (product) => product.categoriaSlug === 'lenceria'
      );
      this.lenceriaProducts.set(filtered);
    });
  }

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
      const next = (this.currentSlide + 1) % this.carouselItems.length;
      this.scrollToSlide(next);
    }, this.AUTOPLAY_DELAY);
  }

  private stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }
}
