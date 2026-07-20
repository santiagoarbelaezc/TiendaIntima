import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface GaleriaItem {
  imagen: string;
  titulo: string;
  categoria: string;
  slug: string;
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.scss'
})
export class GaleriaComponent {
  readonly items: GaleriaItem[] = [
    {
      imagen: 'assets/images/galeria_1.png',
      titulo: 'Sets de Satén de Lujo',
      categoria: 'Pijamas',
      slug: 'pijamas'
    },
    {
      imagen: 'assets/images/galeria_2.png',
      titulo: 'Mañanas de Descanso en Casa',
      categoria: 'Línea Hogar',
      slug: 'pijamas'
    },
    {
      imagen: 'assets/images/galeria_3.png',
      titulo: 'Texturas y Encaje Suave',
      categoria: 'Ropa Interior',
      slug: 'ropa-interior'
    },
    {
      imagen: 'assets/images/galeria_4.png',
      titulo: 'Armonía y Confort Diario',
      categoria: 'Descanso',
      slug: 'pijamas'
    },
    {
      imagen: 'assets/images/galeria_5.png',
      titulo: 'Curaduría en Nuestra Boutique',
      categoria: 'Colección',
      slug: 'ropa-interior'
    },
    {
      imagen: 'assets/images/galeria_6.png',
      titulo: 'Batas Florales de Temporada',
      categoria: 'Novedades',
      slug: 'pijamas'
    }
  ];
}
