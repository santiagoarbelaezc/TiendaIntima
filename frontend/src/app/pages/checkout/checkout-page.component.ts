import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../components/button/button.component';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { PedidosService } from '../../services/pedidos.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss'
})
export class CheckoutPageComponent {
  private readonly fb = inject(FormBuilder);
  readonly carritoService = inject(CarritoService);
  private readonly authService = inject(AuthService);
  private readonly pedidosService = inject(PedidosService);

  private readonly currentUser = this.authService.currentUser();
  readonly submitted = signal(false);
  readonly form = this.fb.group({
    nombre: [this.currentUser?.nombre ?? '', [Validators.required]],
    telefono: [this.currentUser?.telefono ?? '', [Validators.required]],
    email: [this.currentUser?.email ?? '', [Validators.required, Validators.email]],
    metodoEntrega: ['domicilio', [Validators.required]],
    metodoPago: ['Nequi', [Validators.required]],
    direccion: this.fb.group({
      alias: ['Casa', [Validators.required]],
      ciudad: ['', [Validators.required]],
      departamento: ['', [Validators.required]],
      linea1: ['', [Validators.required]],
      telefono: ['', [Validators.required]]
    })
  });

  get subtotal() {
    return this.carritoService.subtotal();
  }

  get descuento() {
    return this.carritoService.discount();
  }

  get envio() {
    return this.carritoService.shipping();
  }

  get total() {
    return this.carritoService.total();
  }

  submit(): void {
    this.form.markAllAsTouched();

    const currentUser = this.currentUser;

    if (this.form.invalid || this.carritoService.items().length === 0 || !currentUser) {
      return;
    }

    this.pedidosService
      .crearPedido({
        usuario: currentUser,
        items: this.carritoService.items(),
        subtotal: this.subtotal,
        descuento: this.descuento,
        envio: this.envio,
        total: this.total,
        metodoPago: this.form.value.metodoPago as 'Tarjeta' | 'PSE' | 'Nequi',
        metodoEntrega: this.form.value.metodoEntrega as 'domicilio' | 'recoger en tienda',
        cuponAplicado: this.carritoService.appliedCoupon()?.codigo
      })
      .subscribe(() => {
        this.carritoService.clear();
        this.submitted.set(true);
      });
  }
}