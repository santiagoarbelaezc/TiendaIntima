export interface Cupon {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: 'porcentaje' | 'valor';
  valor: number;
  minimo: number;
  activo: boolean;
}