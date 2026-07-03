import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';

import { BadgeComponent } from '../../components/badge/badge.component';
import { ButtonComponent } from '../../components/button/button.component';
import { ColorSwatchComponent } from '../../components/color-swatch/color-swatch.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { PriceTagComponent } from '../../components/price-tag/price-tag.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { QuantityInputComponent } from '../../components/quantity-input/quantity-input.component';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { SizeSelectorComponent } from '../../components/size-selector/size-selector.component';
import { CarritoService } from '../../services/carrito.service';
import { ProductosService } from '../../services/productos.service';
import type { ColorOpcion, Producto } from '../../models/producto';

@Component({
  selector: 'app-producto-detalle-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BadgeComponent, ButtonComponent, ColorSwatchComponent, EmptyStateComponent, PriceTagComponent, ProductCardComponent, QuantityInputComponent, RatingStarsComponent, SizeSelectorComponent],
  templateUrl: './producto-detalle-page.component.html',
  styleUrl: './producto-detalle-page.component.scss'
})
export class ProductoDetallePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productosService = inject(ProductosService);
  private readonly carritoService = inject(CarritoService);

  private readonly slug$ = this.route.paramMap.pipe(map((params) => params.get('slug') ?? ''));
  private readonly product$ = this.slug$.pipe(switchMap((slug) => this.productosService.getProductoPorSlug(slug)));
  readonly product = toSignal(this.product$, { initialValue: undefined as Producto | undefined });
  readonly relatedProducts = toSignal(this.product$.pipe(switchMap((product) => (product ? this.productosService.getRelacionados(product.relacionadoCon) : of([])))), { initialValue: [] as Producto[] });

  readonly selectedImage = signal('');
  readonly selectedSize = signal('');
  readonly selectedColor = signal<ColorOpcion | null>(null);
  readonly quantity = signal(1);
  readonly showSizeGuide = signal(false);

  constructor() {
    effect(() => {
      const product = this.product();

      if (product) {
        this.selectedImage.set(this.selectedImage() || product.imagenes[0]);
        this.selectedSize.set(this.selectedSize() || product.tallas[0]);
        this.selectedColor.set(this.selectedColor() || product.colores[0]);
      }
    });
  }

  addToCart(): void {
    const product = this.product();
    const color = this.selectedColor();

    if (!product || !this.selectedSize() || !color) {
      return;
    }

    this.carritoService.add(product, {
      talla: this.selectedSize(),
      color,
      cantidad: this.quantity()
    });
  }
}