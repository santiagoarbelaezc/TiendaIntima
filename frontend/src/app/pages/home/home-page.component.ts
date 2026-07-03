import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { BannerPromocionalComponent } from '../../shared/banner-promocional/banner-promocional.component';
import { HeroComponent } from '../../shared/hero/hero.component';
import { NewsletterSignupComponent } from '../../shared/newsletter-signup/newsletter-signup.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroComponent, BannerPromocionalComponent, NewsletterSignupComponent, ProductCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  private readonly productosService = inject(ProductosService);
  readonly featuredProducts = toSignal(this.productosService.getProductosDestacados(), { initialValue: [] });
  readonly categories = toSignal(this.productosService.getCategorias(), { initialValue: [] });
}