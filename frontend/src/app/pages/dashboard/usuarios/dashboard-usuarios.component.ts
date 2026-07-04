import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { AdminService } from '../../../services/admin.service';
import { ColumnDef, DataTableComponent } from '../../../components/dashboard/data-table/data-table.component';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './dashboard-usuarios.component.html'
})
export class DashboardUsuariosComponent {
  private readonly adminService = inject(AdminService);

  readonly initialUsers = toSignal(this.adminService.getUsuarios(), { initialValue: [] });
  readonly usersSignal = signal<Usuario[]>([]);
  readonly selectedUser = signal<Usuario | null>(null);
  readonly showModal = signal(false);

  readonly columns: ColumnDef[] = [
    { key: 'nombre', header: 'Nombre', type: 'text' },
    { key: 'email', header: 'Correo Electrónico', type: 'text' },
    { key: 'telefono', header: 'Teléfono', type: 'text' },
    { key: 'fechaRegistro', header: 'Fecha de Registro', type: 'date' },
    { key: 'rolDisplay', header: 'Rol', type: 'badge', align: 'center' }
  ];

  get formattedUsers(): any[] {
    const list = this.usersSignal().length > 0 ? this.usersSignal() : this.initialUsers();
    return list.map(u => ({
      ...u,
      rolDisplay: (u.rol || 'cliente').toUpperCase()
    }));
  }

  onTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.selectedUser.set(event.row);
      this.showModal.set(true);
    } else if (event.action === 'delete') {
      if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${event.row.nombre}?`)) {
        const current = this.usersSignal().length > 0 ? this.usersSignal() : this.initialUsers();
        this.usersSignal.set(current.filter(u => u.id !== event.row.id));
      }
    }
  }

  toggleRol(): void {
    const user = this.selectedUser();
    if (!user) return;

    const current = this.usersSignal().length > 0 ? this.usersSignal() : this.initialUsers();
    const newRol: 'cliente' | 'admin' = user.rol === 'admin' ? 'cliente' : 'admin';
    
    const updated = current.map(u => u.id === user.id ? { ...u, rol: newRol } : u);
    this.usersSignal.set(updated);
    this.closeModal();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedUser.set(null);
  }
}
