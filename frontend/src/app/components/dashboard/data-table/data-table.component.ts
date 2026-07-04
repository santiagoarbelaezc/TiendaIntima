import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ColumnDef {
  key: string;
  header: string;
  type?: 'text' | 'currency' | 'date' | 'status' | 'custom' | 'badge';
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html'
})
export class DataTableComponent {
  @Input({ required: true }) columns!: ColumnDef[];
  @Input({ required: true }) data!: any[];
  @Input() searchPlaceholder = 'Buscar en la tabla...';
  @Input() searchKey = '';
  @Input() emptyMessage = 'No se encontraron registros para mostrar.';
  
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();

  searchTerm = '';
  currentPage = 1;
  pageSize = 5;

  get filteredData(): any[] {
    if (!this.data) return [];
    if (!this.searchTerm.trim() || !this.searchKey) return this.data;
    const term = this.searchTerm.toLowerCase();
    return this.data.filter(row => {
      const val = row[this.searchKey];
      return val && String(val).toLowerCase().includes(term);
    });
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize) || 1;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onAction(action: string, row: any): void {
    this.actionClick.emit({ action, row });
  }
}
