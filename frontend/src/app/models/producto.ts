export interface ColorOpcion {
  nombre: string;
  hex: string;
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
}