import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GaleriaComponent } from '../../shared/galeria/galeria.component';

@Component({
  selector: 'app-galeria-page',
  standalone: true,
  imports: [CommonModule, RouterLink, GaleriaComponent],
  templateUrl: './galeria-page.component.html',
  styleUrl: './galeria-page.component.scss'
})
export class GaleriaPageComponent {}
