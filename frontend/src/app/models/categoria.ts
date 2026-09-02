export interface BackendCategoria {
  id: number;
  nombre: string;
  id_padre?: number | null;
  subcategorias?: BackendCategoria[];
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  imagen: string;
  acento: string;
  subcategorias: string[];
  id_padre?: number | null;
}