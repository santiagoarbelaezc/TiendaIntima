import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

export interface TestimonioItem {
  nombre: string;
  ciudad: string;
  comentario: string;
  prenda: string;
}

@Component({
  selector: 'app-testimonios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonios.component.html',
  styleUrl: './testimonios.component.scss'
})
export class TestimoniosComponent {
  readonly items: TestimonioItem[] = [
    {
      nombre: 'Catalina Gómez',
      ciudad: 'Pereira, Risaralda',
      comentario: 'Las pijamas de satén son una maravilla total. El tacto es súper suave, no acaloran y el empaque en el que llegó mi orden me hizo sentir que me estaba dando un verdadero regalo de lujo. ¡La atención por WhatsApp fue excelente!',
      prenda: 'Set de Satén Noches de Rosa'
    },
    {
      nombre: 'Mariana López',
      ciudad: 'Bogotá, D.C.',
      comentario: 'Me encantó la calidad del algodón. Tenía miedo de pedir ropa de descanso por internet porque a veces las tallas varían, pero aquí la guía fue exacta y el ajuste es comodísimo para estar en casa o dormir profunda.',
      prenda: 'Pijama Algodón Nublado'
    },
    {
      nombre: 'Andrea Restrepo',
      ciudad: 'Manizales, Caldas',
      comentario: 'Fui directamente a la tienda en Pereira aprovechando un viaje y salí fascinada. El ambiente es hermoso, muy cálido y familiar. Los conjuntos de encaje son delicados pero cómodos para usar todo el día sin molestias.',
      prenda: 'Bralette Encaje Premium'
    }
  ];
}
