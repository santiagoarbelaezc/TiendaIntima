import type { ColorOpcion } from './producto';

export interface ItemCarrito {
  id: string;
  productoId: string;
  slug: string;
  nombre: string;
  imagen: string;
  precio: number;
  cantidad: number;
  talla: string;
  color: ColorOpcion;
}