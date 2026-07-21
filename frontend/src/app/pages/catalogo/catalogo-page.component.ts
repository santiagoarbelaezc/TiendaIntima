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

  // Parámetros adicionales de filtrado
  readonly selectedTalla = signal<string>('all');
  readonly selectedColor = signal<string>('all');
  readonly selectedTipoPrenda = signal<string>('all');

  // Paginación (20 productos por página)
  readonly currentPage = signal<number>(1);
  readonly pageSize = 20;

  readonly quickTabs = [
    { label: 'Todos', slug: 'all' },
    { label: 'Mujer', slug: 'mujer' },
    { label: 'Ropa interior', slug: 'ropa-interior' },
    { label: 'Pijamas', slug: 'pijamas' },
    { label: 'Lencería', slug: 'lenceria' },
    { label: 'Hombre', slug: 'hombre' },
    { label: 'Más Vendidos', slug: 'bestsellers' },
    { label: 'Ofertas', slug: 'ofertas' }
  ];

  private getProductsForActiveCategory(): Producto[] {
    const allProducts = this.products();
    const category = this.categoryFilter();
    const tab = this.selectedTab();
    const activeCat = tab !== 'all' ? tab : category;

    return allProducts.filter((product: Producto) => {
      if (activeCat === 'bestsellers') {
        return Boolean(product.bestseller);
      } else if (activeCat === 'novedades') {
        return Boolean(product.nuevo) || product.categoriaSlug === 'novedades';
      } else if (activeCat === 'ofertas') {
        return product.categoriaSlug === 'ofertas' || Boolean(product.precioAnterior);
      } else if (activeCat === 'mujer') {
        return product.categoriaSlug !== 'hombre' && !product.etiquetas.some(t => t.toLowerCase().includes('hombre'));
      } else if (activeCat === 'ropa-interior') {
        return product.categoriaSlug === 'ropa-interior' || 
          product.categoriaSlug === 'brasieres' || 
          product.categoriaSlug === 'panties' || 
          product.subcategoria?.toLowerCase().includes('brasier') || 
          product.subcategoria?.toLowerCase().includes('panty');
      } else if (activeCat === 'pijamas') {
        return product.categoriaSlug === 'pijamas' || product.subcategoria?.toLowerCase().includes('pijama');
      } else if (activeCat === 'lenceria') {
        return product.categoriaSlug === 'lenceria' || 
          product.subcategoria?.toLowerCase().includes('lencer') || 
          product.etiquetas.some(t => t.toLowerCase().includes('lencer'));
      } else if (activeCat === 'hombre') {
        return product.categoriaSlug === 'hombre' || product.etiquetas.some(t => t.toLowerCase().includes('hombre'));
      } else if (activeCat !== 'all' && activeCat !== '') {
        return product.categoriaSlug === activeCat;
      }
      return true;
    });
  }

  readonly availableTallas = computed(() => {
    const set = new Set<string>();
    this.getProductsForActiveCategory().forEach((p) => {
      if (p.tallas && Array.isArray(p.tallas)) {
        p.tallas.forEach((t) => set.add(t));
      }
    });
    const order: Record<string, number> = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6 };
    return Array.from(set).sort((a, b) => {
      const orderA = order[a] ?? 99;
      const orderB = order[b] ?? 99;
      if (orderA !== 99 || orderB !== 99) return orderA - orderB;
      return a.localeCompare(b);
    });
  });

  readonly availableColores = computed(() => {
    const map = new Map<string, string>();
    this.getProductsForActiveCategory().forEach((p) => {
      if (p.colores && Array.isArray(p.colores)) {
        p.colores.forEach((c) => {
          if (c && c.nombre && c.hex) {
            map.set(c.hex.toUpperCase(), c.nombre);
          }
        });
      }
    });
    return Array.from(map.entries()).map(([hex, nombre]) => ({ hex, nombre }));
  });

  readonly availableTiposPrenda = computed(() => {
    const set = new Set<string>();
    this.getProductsForActiveCategory().forEach((p) => {
      if (p.subcategoria && p.subcategoria.trim() !== '') {
        set.add(p.subcategoria.trim());
      }
    });
    return Array.from(set).sort();
  });

  readonly filteredProducts = computed(() => {
    const allProducts = this.products();
    const search = this.searchTerm().trim().toLowerCase();
    const category = this.categoryFilter();
    const tab = this.selectedTab();
    const sort = this.sortBy();
    const talla = this.selectedTalla();
    const color = this.selectedColor();
    const tipoPrenda = this.selectedTipoPrenda();

    const filtered = allProducts.filter((product: Producto) => {
      // Búsqueda por texto
      const matchesSearch = !search || 
        product.nombre.toLowerCase().includes(search) || 
        product.descripcion.toLowerCase().includes(search) ||
        product.categoriaNombre.toLowerCase().includes(search) ||
        product.etiquetas.some(t => t.toLowerCase().includes(search));

      // Filtro por pestaña rápida o categoría principal
      let matchesCategory = true;
      const activeCat = tab !== 'all' ? tab : category;

      if (activeCat === 'bestsellers') {
        matchesCategory = Boolean(product.bestseller);
      } else if (activeCat === 'novedades') {
        matchesCategory = Boolean(product.nuevo) || product.categoriaSlug === 'novedades';
      } else if (activeCat === 'ofertas') {
        matchesCategory = product.categoriaSlug === 'ofertas' || Boolean(product.precioAnterior);
      } else if (activeCat === 'mujer') {
        matchesCategory = product.categoriaSlug !== 'hombre' && !product.etiquetas.some(t => t.toLowerCase().includes('hombre'));
      } else if (activeCat === 'ropa-interior') {
        matchesCategory = product.categoriaSlug === 'ropa-interior' || 
          product.categoriaSlug === 'brasieres' || 
          product.categoriaSlug === 'panties' || 
          product.subcategoria?.toLowerCase().includes('brasier') || 
          product.subcategoria?.toLowerCase().includes('panty');
      } else if (activeCat === 'pijamas') {
        matchesCategory = product.categoriaSlug === 'pijamas' || product.subcategoria?.toLowerCase().includes('pijama');
      } else if (activeCat === 'lenceria') {
        matchesCategory = product.categoriaSlug === 'lenceria' || 
          product.subcategoria?.toLowerCase().includes('lencer') || 
          product.etiquetas.some(t => t.toLowerCase().includes('lencer'));
      } else if (activeCat === 'hombre') {
        matchesCategory = product.categoriaSlug === 'hombre' || product.etiquetas.some(t => t.toLowerCase().includes('hombre'));
      } else if (activeCat !== 'all' && activeCat !== '') {
        matchesCategory = product.categoriaSlug === activeCat;
      }

      // Filtro por Talla
      const matchesTalla = talla === 'all' || (product.tallas && product.tallas.includes(talla));

      // Filtro por Color
      const matchesColor = color === 'all' || (product.colores && product.colores.some(c => c.hex.toUpperCase() === color.toUpperCase() || c.nombre.toLowerCase().includes(color.toLowerCase())));

      // Filtro por Tipo de Prenda
      const matchesTipoPrenda = tipoPrenda === 'all' || (product.subcategoria && product.subcategoria.toLowerCase() === tipoPrenda.toLowerCase());

      return matchesSearch && matchesCategory && matchesTalla && matchesColor && matchesTipoPrenda;
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

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize)));

  readonly paginatedProducts = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  private resetSubFilters(): void {
    this.selectedTalla.set('all');
    this.selectedColor.set('all');
    this.selectedTipoPrenda.set('all');
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

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
      this.resetSubFilters();
    });
  }

  onTabSelect(slug: string): void {
    this.selectedTab.set(slug);
    this.resetSubFilters();
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
    this.resetSubFilters();
    if (newCategory === 'all') {
      this.router.navigate(['/catalogo']);
    } else {
      this.router.navigate(['/catalogo'], { queryParams: { categoria: newCategory } });
    }
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onSortChange(sort: 'relevancia' | 'precio-asc' | 'precio-desc' | 'novedades'): void {
    this.sortBy.set(sort);
    this.currentPage.set(1);
  }

  onTallaSelect(talla: string): void {
    this.selectedTalla.set(this.selectedTalla() === talla ? 'all' : talla);
    this.currentPage.set(1);
  }

  onColorSelect(hex: string): void {
    this.selectedColor.set(this.selectedColor() === hex ? 'all' : hex);
    this.currentPage.set(1);
  }

  onTipoPrendaChange(tipo: string): void {
    this.selectedTipoPrenda.set(tipo);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.categoryFilter.set('all');
    this.selectedTab.set('all');
    this.selectedTalla.set('all');
    this.selectedColor.set('all');
    this.selectedTipoPrenda.set('all');
    this.sortBy.set('relevancia');
    this.currentPage.set(1);
    this.router.navigate(['/catalogo']);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.setPage(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.setPage(this.currentPage() - 1);
    }
  }

  get pagesArray(): number[] {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }
}