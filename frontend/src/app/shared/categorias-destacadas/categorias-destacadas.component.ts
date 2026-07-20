import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface CategoriaDestacada {
  nombre: string;
  slug: string;
  imagen: string;
  subtitulo: string;
}

@Component({
  selector: 'app-categorias-destacadas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categorias-destacadas.component.html'
})
export class CategoriasDestacadasComponent {
  readonly categorias: CategoriaDestacada[] = [
    {
      nombre: 'Ropa interior',
      slug: 'ropa-interior',
      imagen: 'assets/images/categorias/cat_ropa_interior.png',
      subtitulo: 'Esenciales de confort diario'
    },
    {
      nombre: 'Pijama',
      slug: 'pijamas',
      imagen: 'assets/images/categorias/cat_pijama.png',
      subtitulo: 'Suavidad, satén y descanso'
    },
    {
      nombre: 'Lencería',
      slug: 'lenceria',
      imagen: 'assets/images/categorias/cat_lenceria.png',
      subtitulo: 'Encajes y sofisticación pura'
    },
    {
      nombre: 'Hombre',
      slug: 'hombre',
      imagen: 'assets/images/categorias/cat_hombre.png',
      subtitulo: 'Línea masculina de descanso'
    }
  ];
}
