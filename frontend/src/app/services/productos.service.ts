import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, shareReplay } from 'rxjs';

import type { Categoria } from '../models/categoria';
import type { Producto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly productos$ = this.http.get<Producto[]>('assets/mock-data/productos.json').pipe(delay(200), shareReplay(1));
  private readonly categorias$ = this.http.get<Categoria[]>('assets/mock-data/categorias.json').pipe(delay(150), shareReplay(1));

  getProductos(): Observable<Producto[]> {
    return this.productos$;
  }

  getCategorias(): Observable<Categoria[]> {
    return this.categorias$;
  }

  getProductosDestacados(): Observable<Producto[]> {
    return this.productos$.pipe(map((productos) => productos.filter((producto) => producto.bestseller).slice(0, 4)));
  }

  getNovedades(): Observable<Producto[]> {
    return this.productos$.pipe(map((productos) => productos.filter((producto) => producto.nuevo).slice(0, 6)));
  }

  getProductoPorSlug(slug: string): Observable<Producto | undefined> {
    return this.productos$.pipe(map((productos) => productos.find((producto) => producto.slug === slug)));
  }

  getRelacionados(slugs: string[]): Observable<Producto[]> {
    return this.productos$.pipe(map((productos) => productos.filter((producto) => slugs.includes(producto.slug)).slice(0, 4)));
  }
}