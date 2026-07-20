import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../components/button/button.component';
import { MapaUbicacionComponent } from '../../shared/mapa-ubicacion/mapa-ubicacion.component';

@Component({
  selector: 'app-contacto-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, MapaUbicacionComponent],
  templateUrl: './contacto-page.component.html',
  styleUrl: './contacto-page.component.scss'
})
export class ContactoPageComponent {
  readonly successMessage = signal('');
  readonly form = new FormBuilder().group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    mensaje: ['', [Validators.required, Validators.minLength(10)]]
  });

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.successMessage.set('Mensaje enviado. Te responderemos pronto desde Tiendaintima.');
  }
}