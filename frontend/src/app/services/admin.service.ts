import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, delay, shareReplay, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

export interface AdminKpis {
  totalCotizacionesWhatsApp: number;
  totalInteracciones: number;
  prendasActivas: number;
  fotosGaleria: number;
  usuariosAdmin: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface TopProductoAdmin {
  id: string;
  nombre: string;
  categoria: string;
  consultas: number;
  precio: number;
}

export interface AdminStats {
  kpis: AdminKpis;
  consultasPorDia: ChartData;
  prendasPorCategoria: ChartData;
  canalesInteraccion: ChartData;
  topProductos: TopProductoAdmin[];
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
  heroNotice?: string;
  direccionFisica?: string;
}

export interface GaleriaItemAdmin {
  id: number;
  titulo: string;
  imagen_url: string;
  orden: number;
  activo: number;
  created_at?: string;
}

export interface BackupItemAdmin {
  filename: string;
  size_bytes: number;
  size_formatted: string;
  cloudinary_url?: string;
  created_at: string;
}

const SETTINGS_KEY = 'tiendaintima-admin-settings';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly users$ = this.http.get<Usuario[]>('assets/mock-data/usuarios.json').pipe(
    delay(150),
    shareReplay(1)
  );

  private readonly settingsSignal = signal<SiteSettings>(this.loadSettings());
  readonly siteSettings = computed(() => this.settingsSignal());

  constructor() {
    this.fetchRemoteSettings();
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<any>(`${this.baseUrl}/analytics/dashboard`).pipe(
      map((res) => {
        const raw = (res && res.success && res.data) ? res.data : (res || {});
        return {
          kpis: {
            totalCotizacionesWhatsApp: raw.kpis?.totalCotizacionesWhatsApp ?? 0,
            totalInteracciones: raw.kpis?.totalInteracciones ?? 0,
            prendasActivas: raw.kpis?.prendasActivas ?? 0,
            fotosGaleria: raw.kpis?.fotosGaleria ?? 0,
            usuariosAdmin: raw.kpis?.usuariosAdmin ?? 1
          },
          consultasPorDia: {
            labels: raw.consultasPorDia?.labels?.length ? raw.consultasPorDia.labels : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            data: raw.consultasPorDia?.data?.length ? raw.consultasPorDia.data : [0, 0, 0, 0, 0, 0, 0]
          },
          prendasPorCategoria: {
            labels: raw.prendasPorCategoria?.labels?.length ? raw.prendasPorCategoria.labels : ['Pijamas', 'Ropa interior', 'Lencería', 'Hombre'],
            data: raw.prendasPorCategoria?.data?.length ? raw.prendasPorCategoria.data : [1, 1, 1, 1]
          },
          canalesInteraccion: {
            labels: raw.canalesInteraccion?.labels?.length ? raw.canalesInteraccion.labels : ['Cotizaciones WhatsApp', 'Vistas de Detalle Prenda', 'Otras Interacciones'],
            data: raw.canalesInteraccion?.data?.length ? raw.canalesInteraccion.data : [0, 0, 0]
          },
          topProductos: raw.topProductos?.length ? raw.topProductos : []
        };
      }),
      catchError(() => of({
        kpis: {
          totalCotizacionesWhatsApp: 0,
          totalInteracciones: 0,
          prendasActivas: 0,
          fotosGaleria: 0,
          usuariosAdmin: 1
        },
        consultasPorDia: {
          labels: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
          data: [0, 0, 0, 0, 0, 0, 0]
        },
        prendasPorCategoria: {
          labels: ['Pijamas', 'Ropa interior', 'Lencería', 'Hombre'],
          data: [0, 0, 0, 0]
        },
        canalesInteraccion: {
          labels: ['Cotizaciones WhatsApp', 'Vistas de Detalle Prenda', 'Otras Interacciones'],
          data: [0, 0, 0]
        },
        topProductos: []
      }))
    );
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.users$;
  }

  // --- Personalización del Sitio Web ---
  saveSettings(newSettings: SiteSettings): void {
    this.settingsSignal.set(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

    const payload: Record<string, string> = {
      brand_name: newSettings.brandName,
      slogan: newSettings.slogan,
      topbar_active: newSettings.topBarActive ? '1' : '0',
      topbar_msg1: newSettings.topBarMessages[0] || '',
      topbar_msg2: newSettings.topBarMessages[1] || '',
      hero_title: newSettings.heroTitle,
      hero_subtitle: newSettings.heroSubtitle,
      hero_cta: newSettings.heroCta,
      hero_notice: newSettings.heroNotice || 'Envíos a domicilio solo en Calarcá, Quindío',
      instagram_url: newSettings.instagramUrl,
      whatsapp_number: newSettings.whatsappUrl
    };

    this.http.put(`${this.baseUrl}/configuracion`, payload).subscribe({
      next: () => console.log('Configuración guardada en backend'),
      error: (err) => console.warn('No se pudo guardar en backend:', err)
    });
  }

  // --- Galería de Fotos ---
  getGaleria(): Observable<GaleriaItemAdmin[]> {
    return this.http.get<any>(`${this.baseUrl}/galeria/admin`).pipe(
      map((res) => (res && res.success && Array.isArray(res.data) ? res.data : [])),
      catchError(() => of([]))
    );
  }

  addGaleriaItem(titulo: string, imagenUrl: string, orden = 0): Observable<any> {
    return this.http.post(`${this.baseUrl}/galeria`, { titulo, imagen_url: imagenUrl, orden });
  }

  deleteGaleriaItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/galeria/${id}`);
  }

  // --- Backups de Base de Datos ---
  getBackups(): Observable<BackupItemAdmin[]> {
    return this.http.get<any>(`${this.baseUrl}/backups`).pipe(
      map((res) => (res && res.success && Array.isArray(res.data) ? res.data : [])),
      catchError(() => of([]))
    );
  }

  createBackup(): Observable<any> {
    return this.http.post(`${this.baseUrl}/backups`, {});
  }

  deleteBackup(filename: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/backups/${filename}`);
  }

  getBackupDownloadUrl(filename: string): string {
    return `${this.baseUrl}/backups/download?file=${encodeURIComponent(filename)}`;
  }

  private fetchRemoteSettings(): void {
    this.http.get<any>(`${this.baseUrl}/configuracion`).subscribe({
      next: (res) => {
        const conf = res?.data || res;
        if (conf && typeof conf === 'object') {
          this.settingsSignal.update((s) => ({
            ...s,
            brandName: conf.brand_name || s.brandName,
            slogan: conf.slogan || s.slogan,
            topBarActive: conf.topbar_active !== '0' && conf.topbar_active !== false,
            topBarMessages: [
              conf.topbar_msg1 || s.topBarMessages[0],
              conf.topbar_msg2 || s.topBarMessages[1]
            ].filter(Boolean),
            heroTitle: conf.hero_title || s.heroTitle,
            heroSubtitle: conf.hero_subtitle || s.heroSubtitle,
            heroNotice: conf.hero_notice || s.heroNotice,
            heroCta: conf.hero_cta || s.heroCta,
            instagramUrl: conf.instagram_url || s.instagramUrl,
            whatsappUrl: conf.whatsapp_number ? `https://wa.me/${conf.whatsapp_number.replace(/\D/g, '')}` : s.whatsappUrl
          }));
        }
      },
      error: () => {}
    });
  }

  private loadSettings(): SiteSettings {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(SETTINGS_KEY) : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      brandName: 'Tiendaintima',
      slogan: 'Moda íntima y descanso',
      topBarActive: true,
      topBarMessages: [
        'Envíos a domicilio exclusivos en Calarcá, Quindío',
        'Nueva colección de pijamas y descanso'
      ],
      heroTitle: 'Descanso & Confort',
      heroSubtitle: 'Pijamas y prendas íntimas suaves para tu comodidad diaria.',
      heroNotice: 'Envíos a domicilio solo en Calarcá, Quindío',
      heroCta: 'Ver Catálogo',
      instagramUrl: 'https://instagram.com/tiendaintima',
      whatsappUrl: 'https://wa.me/573001234567'
    };
  }
}
