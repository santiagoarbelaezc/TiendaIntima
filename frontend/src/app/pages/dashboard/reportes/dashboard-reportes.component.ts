import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { AdminService, PedidoAdmin } from '../../../services/admin.service';
import { ColumnDef, DataTableComponent } from '../../../components/dashboard/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../components/dashboard/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, StatusBadgeComponent],
  templateUrl: './dashboard-reportes.component.html'
})
export class DashboardReportesComponent {
  private readonly adminService = inject(AdminService);

  readonly stats = toSignal(this.adminService.getStats(), { initialValue: null });
  readonly selectedFilter = signal<string>('todos');

  readonly columns: ColumnDef[] = [
    { key: 'id', header: 'ID Pedido', type: 'text' },
    { key: 'cliente', header: 'Cliente / Comprador', type: 'text' },
    { key: 'fecha', header: 'Fecha de Transacción', type: 'date' },
    { key: 'items', header: 'Artículos', type: 'text', align: 'center' },
    { key: 'total', header: 'Total Pagado', type: 'currency', align: 'right' },
    { key: 'estado', header: 'Estado', type: 'badge', align: 'center' }
  ];

  get filteredPedidos(): PedidoAdmin[] {
    const s = this.stats();
    if (!s) return [];
    const filter = this.selectedFilter();
    if (filter === 'todos') return s.ultimosPedidos;
    return s.ultimosPedidos.filter(p => p.estado.toLowerCase() === filter);
  }

  setFilter(status: string): void {
    this.selectedFilter.set(status);
  }

  exportCsv(): void {
    const pedidos = this.filteredPedidos;
    if (pedidos.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const headers = ['ID Pedido', 'Cliente', 'Fecha', 'Items', 'Total', 'Estado'];
    const rows = pedidos.map(p => [
      p.id,
      `"${p.cliente}"`,
      p.fecha,
      p.items,
      p.total,
      p.estado
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_tiendaintima_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      const p = event.row as PedidoAdmin;
      const nextStatus = p.estado === 'pendiente' ? 'enviado' : p.estado === 'enviado' ? 'entregado' : 'pendiente';
      alert(`Actualizando el estado del pedido ${p.id} a: "${nextStatus.toUpperCase()}"`);
    } else if (event.action === 'delete') {
      alert(`Función para archivar pedido ${event.row.id}`);
    }
  }
}
