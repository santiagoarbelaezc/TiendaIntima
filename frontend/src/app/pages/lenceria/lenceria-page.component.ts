import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductosService } from '../../services/productos.service';
import type { Producto } from '../../models/producto';

@Component({
  selector: 'app-lenceria-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './lenceria-page.component.html',
  styleUrl: './lenceria-page.component.scss'
})
export class LenceriaPageComponent {
  private readonly productosService = inject(ProductosService);
  
  readonly allProducts = toSignal(this.productosService.getProductos(), { initialValue: [] as Producto[] });
  readonly lenceriaProducts = signal<Producto[]>([]);

  constructor() {
    effect(() => {
      const filtered = this.allProducts().filter(
        (product) => product.categoriaSlug === 'lenceria'
      );
      this.lenceriaProducts.set(filtered);
    });
  }
}
