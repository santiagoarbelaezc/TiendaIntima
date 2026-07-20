import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductosService } from '../../services/productos.service';
import { HeroComponent } from '../../shared/hero/hero.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { BannerPromocionalComponent } from '../../shared/banner-promocional/banner-promocional.component';
import { NewsletterSignupComponent } from '../../shared/newsletter-signup/newsletter-signup.component';
import { BeneficiosComponent } from '../../shared/beneficios/beneficios.component';
import { CategoriasDestacadasComponent } from '../../shared/categorias-destacadas/categorias-destacadas.component';
import { GaleriaComponent } from '../../shared/galeria/galeria.component';
import { TestimoniosComponent } from '../../shared/testimonios/testimonios.component';
import { MapaUbicacionComponent } from '../../shared/mapa-ubicacion/mapa-ubicacion.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    HeroComponent, 
    BannerPromocionalComponent, 
    NewsletterSignupComponent, 
    ProductCardComponent,
    BeneficiosComponent,
    CategoriasDestacadasComponent,
    GaleriaComponent,
    TestimoniosComponent,
    MapaUbicacionComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  private readonly productosService = inject(ProductosService);
  readonly featuredProducts = toSignal(this.productosService.getProductosDestacados(), { initialValue: [] });
  readonly categories = toSignal(this.productosService.getCategorias(), { initialValue: [] });
}