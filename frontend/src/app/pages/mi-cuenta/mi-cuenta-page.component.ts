import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { AuthService } from '../../services/auth.service';
import { PedidosService } from '../../services/pedidos.service';

@Component({
  selector: 'app-mi-cuenta-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent],
  templateUrl: './mi-cuenta-page.component.html',
  styleUrl: './mi-cuenta-page.component.scss'
})
export class MiCuentaPageComponent {
  private readonly authService = inject(AuthService);
  private readonly pedidosService = inject(PedidosService);

  readonly currentUser = this.authService.currentUser();
  readonly orders = toSignal(this.currentUser ? this.pedidosService.getPedidosPorUsuario(this.currentUser.id) : this.pedidosService.getPedidosPorUsuario(''), { initialValue: [] });
}