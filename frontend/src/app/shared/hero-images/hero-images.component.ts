import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

interface HeroImageItem {
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

@Component({
  selector: 'app-hero-images',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-images.component.html',
  styleUrl: './hero-images.component.scss'
})
export class HeroImagesComponent implements AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  readonly items: HeroImageItem[] = [
    {
      img: 'assets/images/hero-main.svg',
      title: 'Pijamas suaves',
      subtitle: 'Siluetas relajadas para noches tranquilas.',
      link: '/catalogo?categoria=pijamas'
    },
    {
      img: 'assets/images/product-04.svg',
      title: 'Ropa interior',
      subtitle: 'Piezas delicadas con ajuste cómodo.',
      link: '/catalogo?categoria=ropa-interior'
    },
    {
      img: 'assets/images/product-03.svg',
      title: 'Novedades',
      subtitle: 'Texturas nuevas para renovar tu armario.',
      link: '/catalogo?filter=nuevo'
    }
  ];

  currentSlide = 0;

  ngAfterViewInit(): void {
    this.syncCurrentSlide();
  }

  scrollToSlide(index: number): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) {
      return;
    }

    const slideWidth = container.clientWidth;
    container.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
    this.currentSlide = index;
  }

  onScroll(): void {
    this.syncCurrentSlide();
  }

  private syncCurrentSlide(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) {
      return;
    }

    const slideWidth = container.clientWidth || 1;
    this.currentSlide = Math.round(container.scrollLeft / slideWidth);
  }
}