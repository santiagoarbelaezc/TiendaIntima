import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { environment } from '../../environments/environment';
import type { BackendCategoria, Categoria } from '../models/categoria';
import type { BackendProducto, ColorOpcion, Producto } from '../models/producto';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ProductFilters {
  search?: string;
  id_categoria?: number;
  id_marca?: number;
  genero?: string;
  activo?: number;
  page?: number;
  limit?: number;
}

function slugify(text: string): string {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function mapBackendProducto(b: BackendProducto): Producto {
  const images = (b.imagenes && b.imagenes.length > 0)
    ? b.imagenes.sort((x, y) => (y.es_principal ? 1 : 0) - (x.es_principal ? 1 : 0)).map((img) => img.url)
    : ['assets/images/card/c1.png'];

  const colorMap = new Map<string, string>();
  const tallasSet = new Set<string>();
  let totalStock = 0;

  if (b.variantes && Array.isArray(b.variantes)) {
    b.variantes.forEach((v) => {
      totalStock += v.stock || 0;
      if (v.talla?.nombre) {
        tallasSet.add(v.talla.nombre.trim());
      }
      if (v.color?.nombre) {
        colorMap.set(v.color.nombre.trim(), v.color.hex || '#111111');
      }
    });
  }

  const colores: ColorOpcion[] = Array.from(colorMap.entries()).map(([nombre, hex]) => ({ nombre, hex }));
  const tallas = Array.from(tallasSet);

  const catName = b.categoria?.nombre || 'General';
  const catSlug = slugify(catName);
  const prodSlug = slugify(b.nombre) ? `${slugify(b.nombre)}-${b.id}` : `producto-${b.id}`;

  const tags: string[] = [];
  if (b.genero) tags.push(b.genero);
  if (b.marca?.nombre) tags.push(b.marca.nombre);

  const destacados: string[] = [];
  if (b.tela?.nombre) destacados.push(`Tela ${b.tela.nombre}`);
  if (b.temporada) destacados.push(`Colección ${b.temporada}`);

  const mainPrice = b.precio_base || (b.variantes?.[0]?.precio ?? 0);

  return {
    id: String(b.id),
    slug: prodSlug,
    nombre: b.nombre,
    categoriaSlug: catSlug,
    categoriaNombre: catName,
    subcategoria: catName,
    descripcion: b.descripcion || '',
    descripcionCorta: b.descripcion ? (b.descripcion.length > 110 ? b.descripcion.slice(0, 107) + '...' : b.descripcion) : '',
    precio: Number(mainPrice),
    calificacion: 4.9,
    resenas: 24,
    tallas: tallas.length > 0 ? tallas : ['Única'],
    colores: colores.length > 0 ? colores : [{ nombre: 'Único', hex: '#111111' }],
    imagenes: images,
    etiquetas: tags,
    destacados,
    composicion: b.tela?.nombre ? `100% ${b.tela.nombre}` : 'Tejido premium suave',
    cuidados: ['Lavar a mano o ciclo suave', 'No usar blanqueador', 'Secar a la sombra'],
    relacionadoCon: [],
    disponible: Boolean(b.activo),
    nuevo: true,
    bestseller: true,
    stock: totalStock,
    genero: b.genero,
    marca: b.marca?.nombre,
    tela: b.tela?.nombre,
    variantes: b.variantes
  };
}

export function mapBackendCategoria(c: any): Categoria {
  const nombre = c.nombre || c.name || '';
  const catSlug = slugify(nombre);
  let subcats: string[] = [];

  if (c.subcategorias && Array.isArray(c.subcategorias)) {
    subcats = c.subcategorias.map((s: any) => typeof s === 'string' ? s : (s?.nombre || '')).filter(Boolean);
  }

  let defaultImg = 'assets/images/card/c1.png';
  const lowerName = nombre.toLowerCase();
  if (lowerName.includes('pijama')) defaultImg = 'assets/images/categorias/cat_pijama.png';
  else if (lowerName.includes('interior') || lowerName.includes('brasier') || lowerName.includes('panty')) defaultImg = 'assets/images/categorias/cat_ropa_interior.png';
  else if (lowerName.includes('lencer')) defaultImg = 'assets/images/categorias/cat_lenceria.png';
  else if (lowerName.includes('hombre')) defaultImg = 'assets/images/categorias/cat_hombre.png';

  return {
    id: String(c.id),
    nombre,
    slug: catSlug,
    descripcion: `Explora nuestra selección de ${nombre}.`,
    imagen: defaultImg,
    acento: '#EAC7D2',
    subcategorias: subcats,
    id_padre: c.id_padre
  };
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = (environment as any).catalogoApiUrl || environment.apiUrl;

  private readonly productos$ = this.fetchProductos().pipe(shareReplay(1));
  private readonly categorias$ = this.fetchCategorias().pipe(shareReplay(1));

  getProductos(filters?: ProductFilters): Observable<Producto[]> {
    if (!filters || Object.keys(filters).length === 0) {
      return this.productos$;
    }
    return this.fetchProductos(filters);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.categorias$;
  }

  getProductosDestacados(): Observable<Producto[]> {
    return this.productos$.pipe(map((productos) => productos.slice(0, 4)));
  }

  getNovedades(): Observable<Producto[]> {
    return this.productos$.pipe(map((productos) => productos.slice(0, 6)));
  }

  getProductoPorSlug(slug: string): Observable<Producto | undefined> {
    return this.productos$.pipe(
      map((productos) => {
        // Match by slug or by ending ID (e.g. 'pijama-satinada-1' matches id '1')
        const found = productos.find((p) => p.slug === slug || p.id === slug);
        if (found) return found;

        const idMatch = slug.match(/-(\d+)$/);
        if (idMatch) {
          const id = idMatch[1];
          return productos.find((p) => p.id === id);
        }
        return undefined;
      })
    );
  }

  getProductoById(id: number | string): Observable<Producto | undefined> {
    return this.http.get<ApiResponse<BackendProducto>>(`${this.baseUrl}/productos/${id}`).pipe(
      map((res) => (res.success && res.data ? mapBackendProducto(res.data) : undefined)),
      catchError(() => this.getProductoPorSlug(String(id)))
    );
  }

  getRelacionados(slugs: string[]): Observable<Producto[]> {
    return this.productos$.pipe(
      map((productos) => {
        if (!slugs || slugs.length === 0) {
          return productos.slice(0, 4);
        }
        const matched = productos.filter((p) => slugs.includes(p.slug) || slugs.includes(p.id));
        return matched.length > 0 ? matched.slice(0, 4) : productos.slice(0, 4);
      })
    );
  }

  trackWhatsAppQuote(productoId: number, varianteId?: number): Observable<boolean> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/analytics/events`, {
      producto_id: productoId,
      variante_id: varianteId,
      event_type: 'whatsapp_quote'
    }).pipe(
      map((res) => Boolean(res.success)),
      catchError(() => of(false))
    );
  }

  private fetchProductos(filters?: ProductFilters): Observable<Producto[]> {
    let params = new HttpParams();

    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.id_categoria) params = params.set('id_categoria', filters.id_categoria);
    if (filters?.id_marca) params = params.set('id_marca', filters.id_marca);
    if (filters?.genero) params = params.set('genero', filters.genero);
    if (filters?.activo !== undefined) params = params.set('activo', filters.activo);
    if (filters?.page) params = params.set('page', filters.page);
    if (filters?.limit) params = params.set('limit', filters.limit);

    return this.http.get<any>(`${this.baseUrl}/productos`, { params }).pipe(
      map((res: any) => {
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
        } else if (res && res.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        }
        return list.map(mapBackendProducto);
      }),
      catchError((err) => {
        console.warn('No se pudo conectar con el endpoint de productos en backend:', err.message || err);
        return of([]);
      })
    );
  }

  private fetchCategorias(treeFormat = true): Observable<Categoria[]> {
    const params = new HttpParams().set('format', treeFormat ? 'tree' : 'flat');

    return this.http.get<any>(`${this.baseUrl}/categorias`, { params }).pipe(
      map((res: any) => {
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
        } else if (res && res.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        }
        return list.map(mapBackendCategoria);
      }),
      catchError((err) => {
        console.warn('No se pudo conectar con el endpoint de categorías en backend:', err.message || err);
        return of([]);
      })
    );
  }
}