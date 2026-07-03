import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../components/button/button.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { QuantityInputComponent } from '../../components/quantity-input/quantity-input.component';
import { CarritoService } from '../../services/carrito.service';
import { CuponesService } from '../../services/cupones.service';

@Component({
  selector: 'app-carrito-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent, EmptyStateComponent, QuantityInputComponent],
  templateUrl: './carrito-page.component.html',
  styleUrl: './carrito-page.component.scss'
})
export class CarritoPageComponent {
  readonly carritoService = inject(CarritoService);
  private readonly cuponesService = inject(CuponesService);

  couponCode = '';
  couponMessage = signal('');

  get items() {
    return this.carritoService.items();
  }

  get subtotal() {
    return this.carritoService.subtotal();
  }

  get discount() {
    return this.carritoService.discount();
  }

  get shipping() {
    return this.carritoService.shipping();
  }

  get total() {
    return this.carritoService.total();
  }

  applyCoupon(): void {
    this.cuponesService.validar(this.couponCode, this.subtotal).subscribe((coupon) => {
      this.carritoService.applyCoupon(coupon);
      this.couponMessage.set(coupon ? `Cupón ${coupon.codigo} aplicado.` : 'El cupón no es válido para este pedido.');
    });
  }
}