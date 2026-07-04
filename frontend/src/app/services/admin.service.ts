import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, delay, shareReplay, tap, map } from 'rxjs';
import { Usuario } from '../models/usuario';
import { Producto } from '../models/producto';
import { Categoria } from '../models/categoria';

export interface AdminKpis {
  ventasMes: number;
  ventasDelta: number;
  pedidosPendientes: number;
  pedidosDelta: number;
  nuevosUsuarios: number;
  usuariosDelta: number;
  ticketPromedio: number;
  ticketDelta: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface EmbudoStage {
  etapa: string;
  valor: number;
  porcentaje: number;
}

export interface TopProductoAdmin {
  id: string;
  nombre: string;
  categoria: string;
  ventas: number;
  ingresos: number;
  stock: number;
}

export interface PedidoAdmin {
  id: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'enviado' | 'entregado' | 'cancelado';
  items: number;
}

export interface AdminStats {
  kpis: AdminKpis;
  ventasPorDia: ChartData;
  ventasPorCategoria: ChartData;
  metodosPago: ChartData;
  embudoConversion: EmbudoStage[];
  topProductos: TopProductoAdmin[];
  ultimosPedidos: PedidoAdmin[];
}

export interface SiteSettings {
  brandName: string;
  slogan: string;
  topBarActive: boolean;
  topBarMessages: string[];
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  instagramUrl: string;
  whatsappUrl: string;
}

const SETTINGS_KEY = 'tiendaintima-admin-settings';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  private readonly stats$ = this.http.get<AdminStats>('assets/mock-data/admin-stats.json').pipe(
    delay(200),
    shareReplay(1)
  );

  private readonly users$ = this.http.get<Usuario[]>('assets/mock-data/usuarios.json').pipe(
    delay(150),
    shareReplay(1)
  );

  private readonly settingsSignal = signal<SiteSettings>(this.loadSettings());
  readonly siteSettings = computed(() => this.settingsSignal());

  getStats(): Observable<AdminStats> {
    return this.stats$;
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.users$;
  }

  saveSettings(newSettings: SiteSettings): void {
    this.settingsSignal.set(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  }

  private loadSettings(): SiteSettings {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback al default
      }
    }
    return {
      brandName: 'Tiendaintima',
      slogan: 'Moda íntima y descanso',
      topBarActive: true,
      topBarMessages: [
        'Envíos a domicilio disponibles',
        'Nueva colección de pijamas',
        'Promo especial en sets seleccionados'
      ],
      heroTitle: 'Siente la suavidad y el confort en cada momento',
      heroSubtitle: 'Descubre nuestra colección de pijamas y ropa interior diseñada para realzar tu belleza y brindarte el máximo descanso.',
      heroCta: 'Ver colección',
      instagramUrl: 'https://instagram.com/tiendaintima',
      whatsappUrl: 'https://wa.me/573001234567'
    };
  }
}
