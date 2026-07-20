import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mapa-ubicacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mapa-ubicacion.component.html',
  styleUrl: './mapa-ubicacion.component.scss'
})
export class MapaUbicacionComponent {}
