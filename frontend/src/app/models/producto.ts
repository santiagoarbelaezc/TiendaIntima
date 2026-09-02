export interface ColorOpcion {
  nombre: string;
  hex: string;
}

export interface BackendVariante {
  id: number;
  id_producto: number;
  sku: string;
  precio: number;
  stock: number;
  color?: { id: number; nombre: string; hex: string };
  talla?: { id: number; nombre: string };
}

export interface BackendProducto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  genero: string;
  temporada: string;
  activo: boolean | number;
  categoria?: { id: number; nombre: string };
  marca?: { id: number; nombre: string };
  tela?: { id: number; nombre: string };
  imagenes?: Array<{ id: number; url: string; es_principal: boolean }>;
  variantes?: BackendVariante[];
}

export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  categoriaSlug: string;
  categoriaNombre: string;
  subcategoria: string;
  descripcion: string;
  descripcionCorta: string;
  precio: number;
  precioAnterior?: number;
  calificacion: number;
  resenas: number;
  tallas: string[];
  colores: ColorOpcion[];
  imagenes: string[];
  etiquetas: string[];
  destacados: string[];
  composicion: string;
  cuidados: string[];
  relacionadoCon: string[];
  disponible: boolean;
  nuevo: boolean;
  bestseller: boolean;
  stock?: number;
  genero?: string;
  marca?: string;
  tela?: string;
  variantes?: BackendVariante[];
}