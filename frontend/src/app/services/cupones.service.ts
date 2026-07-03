import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, delay, shareReplay } from 'rxjs';

import type { Cupon } from '../models/cupon';

@Injectable({ providedIn: 'root' })
export class CuponesService {
  private readonly http = inject(HttpClient);
  private readonly cupones$ = this.http.get<Cupon[]>('assets/mock-data/cupones.json').pipe(delay(120), shareReplay(1));

  validar(codigo: string, subtotal: number): Observable<Cupon | null> {
    const normalizedCode = codigo.trim().toUpperCase();

    if (!normalizedCode) {
      return of(null);
    }

    return this.cupones$.pipe(
      map((cupones) => {
        const cupon = cupones.find((item) => item.codigo === normalizedCode && item.activo);

        if (!cupon || subtotal < cupon.minimo) {
          return null;
        }

        return cupon;
      })
    );
  }
}