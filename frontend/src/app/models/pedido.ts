import type { Direccion } from './direccion';
import type { ItemCarrito } from './item-carrito';

export interface Pedido {
  id: string;
  usuarioId: string;
  fecha: string;
  estado: 'Pendiente' | 'Pagado' | 'En preparación' | 'Enviado' | 'Entregado';
  metodoPago: 'Tarjeta' | 'PSE' | 'Nequi';
  metodoEntrega: 'domicilio' | 'recoger en tienda';
  direccion?: Direccion;
  items: ItemCarrito[];
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  cuponAplicado?: string;
}