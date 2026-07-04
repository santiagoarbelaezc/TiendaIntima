import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AdminService } from '../../../services/admin.service';
import { StatCardComponent } from '../../../components/dashboard/stat-card/stat-card.component';
import { ChartWrapperComponent } from '../../../components/dashboard/chart-wrapper/chart-wrapper.component';
import { StatusBadgeComponent } from '../../../components/dashboard/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, ChartWrapperComponent, StatusBadgeComponent],
  templateUrl: './dashboard-inicio.component.html'
})
export class DashboardInicioComponent {
  private readonly adminService = inject(AdminService);

  readonly stats = toSignal(this.adminService.getStats(), { initialValue: null });
}
