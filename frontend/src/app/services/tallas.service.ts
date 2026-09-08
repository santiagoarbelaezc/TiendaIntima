import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Talla {
  id: number;
  nombre: string;
  orden?: number;
}

export interface TallaGroup {
  id: string;
  name: string;
  shortName: string;
  tallas: Talla[];
}

export function groupTallas(tallas: Talla[]): TallaGroup[] {
  const ropaOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'ÚNICA', 'UNICA', 'TALLA ÚNICA'];
  const numericas = ['6', '8', '10', '12', '14', '16', '18', '20'];
  const ropaGroup: Talla[] = [];
  const brasierCopas: Talla[] = [];
  const brasierTops: Talla[] = [];
  const numericasGroup: Talla[] = [];
  const otrosGroup: Talla[] = [];

  tallas.forEach((t) => {
    const nom = t.nombre.trim().toUpperCase();
    if (ropaOrder.includes(nom)) {
      ropaGroup.push(t);
    } else if (/^\d{2}[A-D]$/.test(nom)) {
      brasierCopas.push(t);
    } else if (/^\d{2}$/.test(nom) && parseInt(nom, 10) >= 30 && parseInt(nom, 10) <= 46) {
      brasierTops.push(t);
    } else if (numericas.includes(nom) || (parseInt(nom, 10) >= 2 && parseInt(nom, 10) <= 24)) {
      numericasGroup.push(t);
    } else {
      otrosGroup.push(t);
    }
  });

  // 1. Ordenar ropa por orden textil estándar
  ropaGroup.sort((a, b) => {
    const ia = ropaOrder.indexOf(a.nombre.trim().toUpperCase());
    const ib = ropaOrder.indexOf(b.nombre.trim().toUpperCase());
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  // 2. Ordenar copas por contorno (30->42) y copa (A->D)
  brasierCopas.sort((a, b) => {
    const numA = parseInt(a.nombre, 10) || 0;
    const numB = parseInt(b.nombre, 10) || 0;
    if (numA !== numB) return numA - numB;
    return a.nombre.localeCompare(b.nombre);
  });

  // 3. Ordenar tops numéricamente
  brasierTops.sort((a, b) => (parseInt(a.nombre, 10) || 0) - (parseInt(b.nombre, 10) || 0));

  // 4. Ordenar fajas/números
  numericasGroup.sort((a, b) => (parseInt(a.nombre, 10) || 0) - (parseInt(b.nombre, 10) || 0));

  const groups: TallaGroup[] = [];
  if (ropaGroup.length > 0) {
    groups.push({
      id: 'ropa',
      name: 'Ropa Íntima / Pijamas (Letras)',
      shortName: 'Ropa / Pijamas',
      tallas: ropaGroup
    });
  }
  if (brasierCopas.length > 0) {
    groups.push({
      id: 'copas',
      name: 'Brasieres y Copas (30B - 42C)',
      shortName: 'Brasieres (Copas)',
      tallas: brasierCopas
    });
  }
  if (brasierTops.length > 0) {
    groups.push({
      id: 'tops',
      name: 'Brasieres y Tops (Contorno 32 - 42)',
      shortName: 'Tops / Contorno',
      tallas: brasierTops
    });
  }
  if (numericasGroup.length > 0) {
    groups.push({
      id: 'numericas',
      name: 'Tallas Numéricas / Fajas (6 - 18)',
      shortName: 'Fajas / Numéricas',
      tallas: numericasGroup
    });
  }
  if (otrosGroup.length > 0) {
    groups.push({
      id: 'otros',
      name: 'Otras Tallas',
      shortName: 'Otras',
      tallas: otrosGroup
    });
  }
  return groups;
}

@Injectable({ providedIn: 'root' })
export class TallasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = (environment as any).catalogoApiUrl || environment.apiUrl;

  private readonly tallas$ = this.fetchTallas().pipe(shareReplay(1));

  getTallas(): Observable<Talla[]> {
    return this.tallas$;
  }

  getTallasAgrupadas(): Observable<TallaGroup[]> {
    return this.tallas$.pipe(map((tallas) => groupTallas(tallas)));
  }

  private fetchTallas(): Observable<Talla[]> {
    return this.http.get<any>(`${this.baseUrl}/tallas`).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        if (res && res.data && Array.isArray(res.data.data)) return res.data.data;
        return [];
      }),
      catchError((err) => {
        console.warn('No se pudo cargar tallas desde el backend:', err?.message || err);
        return of([
          { id: 1, nombre: 'XS' },
          { id: 2, nombre: 'S' },
          { id: 3, nombre: 'M' },
          { id: 4, nombre: 'L' },
          { id: 5, nombre: 'XL' },
          { id: 6, nombre: '32B' },
          { id: 7, nombre: '34B' },
          { id: 8, nombre: '36B' },
          { id: 9, nombre: 'ÚNICA' }
        ]);
      })
    );
  }
}
