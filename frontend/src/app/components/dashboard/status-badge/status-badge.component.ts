import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
      [ngClass]="getBadgeClass()"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getDotClass()"></span>
      <span>{{ status }}</span>
    </span>
  `
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;

  getBadgeClass(): string {
    const s = this.status.toLowerCase();
    if (s === 'entregado' || s === 'activo' || s === 'completado' || s === 'admin') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
    }
    if (s === 'enviado' || s === 'en proceso' || s === 'cliente') {
      return 'bg-sky-50 text-sky-700 border border-sky-200/60';
    }
    if (s === 'pendiente') {
      return 'bg-amber-50 text-amber-700 border border-amber-200/60';
    }
    if (s === 'cancelado' || s === 'inactivo' || s === 'agotado') {
      return 'bg-rose-50 text-rose-700 border border-rose-200/60';
    }
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  }

  getDotClass(): string {
    const s = this.status.toLowerCase();
    if (s === 'entregado' || s === 'activo' || s === 'completado' || s === 'admin') return 'bg-emerald-500';
    if (s === 'enviado' || s === 'en proceso' || s === 'cliente') return 'bg-sky-500';
    if (s === 'pendiente') return 'bg-amber-500 animate-pulse';
    if (s === 'cancelado' || s === 'inactivo' || s === 'agotado') return 'bg-rose-500';
    return 'bg-gray-500';
  }
}
