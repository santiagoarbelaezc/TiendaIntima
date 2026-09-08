export interface BackendCategoria {
  id: number;
  nombre: string;
  id_padre?: number | null;
  creado_en?: string;
  subcategorias?: BackendCategoria[];
  slug?: string;
  descripcion?: string;
  imagen_url?: string;
}

export interface SubcategoriaItem {
  id: number;
  nombre: string;
  slug: string;
  id_padre?: number | null;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  imagen: string;
  acento: string;
  subcategorias: string[];
  subcategoriasCompletas?: SubcategoriaItem[];
  id_padre?: number | null;
}