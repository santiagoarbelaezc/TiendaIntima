import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-politica-envio-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './politica-envio-page.component.html',
  styleUrl: './politica-envio-page.component.scss'
})
export class PoliticaEnvioPageComponent {}
