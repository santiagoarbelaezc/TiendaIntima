import type { Direccion } from './direccion';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  telefono: string;
  fechaRegistro: string;
  direcciones: Direccion[];
  rol?: 'cliente' | 'admin';
}