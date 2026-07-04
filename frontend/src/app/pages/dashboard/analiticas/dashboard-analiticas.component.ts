import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { AdminService } from '../../../services/admin.service';
import { ChartWrapperComponent } from '../../../components/dashboard/chart-wrapper/chart-wrapper.component';
import { StatCardComponent } from '../../../components/dashboard/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard-analiticas',
  standalone: true,
  imports: [CommonModule, ChartWrapperComponent, StatCardComponent],
  templateUrl: './dashboard-analiticas.component.html'
})
export class DashboardAnaliticasComponent {
  private readonly adminService = inject(AdminService);

  readonly stats = toSignal(this.adminService.getStats(), { initialValue: null });
}
