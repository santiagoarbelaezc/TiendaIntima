import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, delay, map, of, shareReplay, tap } from 'rxjs';

import type { Direccion } from '../models/direccion';
import type { ItemCarrito } from '../models/item-carrito';
import type { Pedido } from '../models/pedido';
import type { Usuario } from '../models/usuario';

export interface NewOrderPayload {
  usuario: Usuario;
  items: ItemCarrito[];
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  metodoPago: Pedido['metodoPago'];
  metodoEntrega: Pedido['metodoEntrega'];
  direccion?: Direccion;
  cuponAplicado?: string;
}

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly http = inject(HttpClient);
  private readonly pedidosSignal = signal<Pedido[]>([]);
  private readonly pedidos$ = this.http.get<Pedido[]>('assets/mock-data/pedidos.json').pipe(delay(180), shareReplay(1));

  getPedidos(): Observable<Pedido[]> {
    return this.pedidos$.pipe(tap((pedidos) => this.pedidosSignal.set(pedidos)));
  }

  getPedidosPorUsuario(usuarioId: string): Observable<Pedido[]> {
    return this.getPedidos().pipe(map((pedidos) => pedidos.filter((pedido) => pedido.usuarioId === usuarioId)));
  }

  crearPedido(payload: NewOrderPayload): Observable<Pedido> {
    const pedido: Pedido = {
      id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      usuarioId: payload.usuario.id,
      fecha: new Date().toISOString(),
      estado: 'Pendiente',
      metodoPago: payload.metodoPago,
      metodoEntrega: payload.metodoEntrega,
      direccion: payload.direccion,
      items: payload.items,
      subtotal: payload.subtotal,
      descuento: payload.descuento,
      envio: payload.envio,
      total: payload.total,
      cuponAplicado: payload.cuponAplicado
    };

    this.pedidosSignal.update((pedidos) => [pedido, ...pedidos]);
    return of(pedido).pipe(delay(250));
  }
}