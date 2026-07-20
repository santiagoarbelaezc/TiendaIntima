import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);
  private readonly productosService = inject(ProductosService);

  readonly categoryQuery = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('categoria') ?? '')), { initialValue: '' });
  readonly filterQuery = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('filter') ?? '')), { initialValue: '' });
  readonly products = toSignal(this.productosService.getProductos(), { initialValue: [] as Producto[] });
  readonly categories = toSignal(this.productosService.getCategorias(), { initialValue: [] as Categoria[] });

  readonly searchTerm = signal('');
  readonly categoryFilter = signal('all');
  readonly sortBy = signal<'relevancia' | 'precio-asc' | 'precio-desc' | 'novedades'>('relevancia');
  readonly selectedTab = signal('all');

  readonly quickTabs = [
    { label: 'Todos', slug: 'all' },
    { label: 'Más Vendidos', slug: 'bestsellers' },
    { label: 'Pijamas', slug: 'pijamas' },
    { label: 'Fajas', slug: 'fajas' },
    { label: 'Brasieres', slug: 'brasieres' },
    { label: 'Panties', slug: 'panties' },
    { label: 'Trajes de Baño', slug: 'trajes-de-bano' },
    { label: 'Novias', slug: 'novias' },
    { label: 'Uso Exterior', slug: 'uso-exterior' },
    { label: 'Ofertas', slug: 'ofertas' },
    { label: 'Hombre', slug: 'hombre' }
  ];

  readonly filteredProducts = computed(() => {
    const allProducts = this.products();
    const search = this.searchTerm().trim().toLowerCase();
    const category = this.categoryFilter();
    const tab = this.selectedTab();
    const sort = this.sortBy();

    const filtered = allProducts.filter((product: Producto) => {
      // Búsqueda por texto
      const matchesSearch = !search || 
        product.nombre.toLowerCase().includes(search) || 
        product.descripcion.toLowerCase().includes(search) ||
        product.categoriaNombre.toLowerCase().includes(search) ||
        product.etiquetas.some(t => t.toLowerCase().includes(search));

      // Filtro por pestaña rápida o categoría
      let matchesCategory = true;
      if (tab === 'bestsellers') {
        matchesCategory = Boolean(product.bestseller);
      } else if (tab === 'novedades' || category === 'novedades') {
        matchesCategory = Boolean(product.nuevo) || product.categoriaSlug === 'novedades';
      } else if (tab === 'ofertas' || category === 'ofertas') {
        matchesCategory = product.categoriaSlug === 'ofertas' || Boolean(product.precioAnterior);
      } else if (category !== 'all' && category !== '') {
        matchesCategory = product.categoriaSlug === category;
      }

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((first, second) => {
      if (sort === 'precio-asc') {
        return first.precio - second.precio;
      }
      if (sort === 'precio-desc') {
        return second.precio - first.precio;
      }
      if (sort === 'novedades') {
        return Number(second.nuevo) - Number(first.nuevo);
      }
      return Number(second.bestseller) - Number(first.bestseller);
    });
  });

  constructor() {
    effect(() => {
      const selectedCategory = this.categoryQuery();
      const selectedFilter = this.filterQuery();

      if (selectedFilter === 'nuevo') {
        this.selectedTab.set('novedades');
        this.categoryFilter.set('novedades');
        this.sortBy.set('novedades');
      } else if (selectedFilter === 'promo') {
        this.selectedTab.set('ofertas');
        this.categoryFilter.set('ofertas');
      } else if (selectedCategory) {
        this.categoryFilter.set(selectedCategory);
        this.selectedTab.set(selectedCategory);
      } else {
        this.categoryFilter.set('all');
        this.selectedTab.set('all');
      }
    });
  }

  onTabSelect(slug: string): void {
    this.selectedTab.set(slug);
    if (slug === 'all') {
      this.categoryFilter.set('all');
      this.router.navigate(['/catalogo']);
    } else if (slug === 'bestsellers') {
      this.categoryFilter.set('all');
      this.sortBy.set('relevancia');
      this.router.navigate(['/catalogo']);
    } else {
      this.categoryFilter.set(slug);
      this.router.navigate(['/catalogo'], { queryParams: { categoria: slug } });
    }
  }

  onCategoryChange(newCategory: string): void {
    this.categoryFilter.set(newCategory);
    this.selectedTab.set(newCategory);
    if (newCategory === 'all') {
      this.router.navigate(['/catalogo']);
    } else {
      this.router.navigate(['/catalogo'], { queryParams: { categoria: newCategory } });
    }
  }
}