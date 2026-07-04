import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, delay, map, of, shareReplay, tap } from 'rxjs';

import type { Usuario } from '../models/usuario';

const storageKey = 'tiendaintima-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserSignal = signal<Usuario | null>(this.readSession());
  private readonly users$ = this.http.get<Usuario[]>('assets/mock-data/usuarios.json').pipe(delay(150), shareReplay(1));

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  constructor() {
    effect(() => {
      const currentUser = this.currentUserSignal();

      if (currentUser) {
        localStorage.setItem(storageKey, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(storageKey);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  login(email: string, password: string): Observable<Usuario> {
    return this.users$.pipe(
      map((users) => {
        const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);

        if (!user) {
          throw new Error('Credenciales inválidas');
        }

        return user;
      }),
      tap((user) => this.currentUserSignal.set(user))
    );
  }

  loginAsAdminDemo(): Observable<Usuario> {
    return this.users$.pipe(
      map((users) => {
        const user = users.find((item) => item.rol === 'admin' || item.email.toLowerCase() === 'laura@demo.com');
        if (!user) {
          const fallbackAdmin: Usuario = {
            id: 'u1',
            nombre: 'Laura Gómez (Admin)',
            email: 'laura@demo.com',
            password: '123456',
            telefono: '3001234567',
            fechaRegistro: new Date().toISOString(),
            rol: 'admin',
            direcciones: []
          };
          return fallbackAdmin;
        }
        return user;
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
      direcciones: []
    };

    this.currentUserSignal.set(user);
    return of(user).pipe(delay(200));
  }

  logout(): void {
    this.currentUserSignal.set(null);
  }

  private readSession(): Usuario | null {
    const session = localStorage.getItem(storageKey);

    if (!session) {
      return null;
    }

    try {
      return JSON.parse(session) as Usuario;
    } catch {
      return null;
    }
  }
}