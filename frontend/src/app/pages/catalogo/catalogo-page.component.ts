import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';

import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductosService } from '../../services/productos.service';
import type { Producto } from '../../models/producto';
import type { Categoria } from '../../models/categoria';

@Component({
  selector: 'app-catalogo-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent, EmptyStateComponent],
  templateUrl: './catalogo-page.component.html',
  styleUrl: './catalogo-page.component.scss'
})
export class CatalogoPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productosService = inject(ProductosService);

  readonly categoryQuery = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('categoria') ?? '')), { initialValue: '' });
  readonly filterQuery = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('filter') ?? '')), { initialValue: '' });
  readonly products = toSignal(this.productosService.getProductos(), { initialValue: [] as Producto[] });
  readonly categories = toSignal(this.productosService.getCategorias(), { initialValue: [] as Categoria[] });

  searchTerm = '';
  categoryFilter = 'all';
  sortBy: 'relevancia' | 'precio-asc' | 'precio-desc' | 'novedades' = 'relevancia';

  readonly filteredProducts = signal<Producto[]>([]);

  constructor() {
    effect(() => {
      const selectedCategory = this.categoryQuery();
      const selectedFilter = this.filterQuery();
      this.categoryFilter = selectedCategory || 'all';

      if (selectedFilter === 'nuevo') {
        this.sortBy = 'novedades';
      }

      this.applyFilters();
    });
  }

  applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();
    const category = this.categoryFilter;

    const filtered = this.products().filter((product: Producto) => {
      const matchesCategory = category === 'all' || product.categoriaSlug === category;
      const matchesSearch = !normalizedSearch || product.nombre.toLowerCase().includes(normalizedSearch) || product.descripcion.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });

    const sorted = [...filtered].sort((first, second) => {
      if (this.sortBy === 'precio-asc') {
        return first.precio - second.precio;
      }

      if (this.sortBy === 'precio-desc') {
        return second.precio - first.precio;
      }

      if (this.sortBy === 'novedades') {
        return Number(second.nuevo) - Number(first.nuevo);
      }

      return Number(second.bestseller) - Number(first.bestseller);
    });

    this.filteredProducts.set(sorted);
  }
}