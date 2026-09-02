import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, delay, map, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import type { Usuario } from '../models/usuario';

const storageKey = 'tiendaintima-user';
const tokenKey = 'auth_token';

interface LoginApiResponse {
  success: boolean;
  data: {
    token: string;
    expires_in?: number;
    user: {
      id: number | string;
      email: string;
      nombre: string;
      telefono?: string;
      rol?: 'cliente' | 'admin';
      created_at?: string;
    };
  };
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly currentUserSignal = signal<Usuario | null>(this.readSession());

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  constructor() {
    effect(() => {
      const currentUser = this.currentUserSignal();
      if (typeof localStorage !== 'undefined') {
        if (currentUser) {
          localStorage.setItem(storageKey, JSON.stringify(currentUser));
        } else {
          localStorage.removeItem(storageKey);
          localStorage.removeItem(tokenKey);
        }
      }
    });
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(tokenKey);
  }

  login(email: string, password: string): Observable<Usuario> {
    return this.http.post<LoginApiResponse>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      map((res) => {
        if (!res || !res.success || !res.data) {
          throw new Error(res?.message || 'Error al iniciar sesión');
        }

        const data = res.data;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(tokenKey, data.token);
        }

        const role: 'cliente' | 'admin' = (data.user.email?.toLowerCase().includes('admin') || data.user.rol === 'admin')
          ? 'admin'
          : 'cliente';

        const usuario: Usuario = {
          id: String(data.user.id),
          nombre: data.user.nombre,
          email: data.user.email,
          telefono: data.user.telefono || '',
          fechaRegistro: data.user.created_at || new Date().toISOString(),
          direcciones: [],
          rol: role
        };

        return usuario;
      }),
      tap((user) => this.currentUserSignal.set(user))
    );
  }

  register(payload: Pick<Usuario, 'nombre' | 'email' | 'telefono'> & { password: string }): Observable<Usuario> {
    const user: Usuario = {
      id: `u-${Date.now()}`,
      nombre: payload.nombre,
      email: payload.email,
      telefono: payload.telefono,
      fechaRegistro: new Date().toISOString(),
      direcciones: [],
      rol: 'cliente'
    };

    this.currentUserSignal.set(user);
    return of(user).pipe(delay(200));
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(storageKey);
    }
    this.currentUserSignal.set(null);
  }

  private readSession(): Usuario | null {
    if (typeof localStorage === 'undefined') return null;
    const session = localStorage.getItem(storageKey);
    if (!session) return null;

    try {
      return JSON.parse(session) as Usuario;
    } catch {
      return null;
    }
  }
}