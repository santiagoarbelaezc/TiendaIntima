import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductosService } from '../../../services/productos.service';
import { ColumnDef, DataTableComponent } from '../../../components/dashboard/data-table/data-table.component';
import { Producto } from '../../../models/producto';

@Component({
  selector: 'app-dashboard-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './dashboard-productos.component.html'
})
export class DashboardProductosComponent {
  private readonly productosService = inject(ProductosService);
  private readonly fb = inject(FormBuilder);

  readonly initialProductos = toSignal(this.productosService.getProductos(), { initialValue: [] });
  readonly productosSignal = signal<Producto[]>([]);
  readonly showModal = signal(false);
  readonly editingProducto = signal<Producto | null>(null);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required]],
    categoria: ['pijamas', [Validators.required]],
    precio: [100000, [Validators.required, Validators.min(1000)]],
    precioPromocional: [0],
    stock: [15, [Validators.required, Validators.min(0)]],
    descripcion: ['Hermosa prenda diseñada con los mejores materiales.', [Validators.required]]
  });

  readonly columns: ColumnDef[] = [
    { key: 'nombre', header: 'Nombre del Producto', type: 'text' },
    { key: 'categoriaNombre', header: 'Categoría', type: 'badge', align: 'center' },
    { key: 'precio', header: 'Precio Normal', type: 'currency', align: 'right' },
    { key: 'stockDisplay', header: 'Stock', type: 'text', align: 'center' },
    { key: 'estadoDisplay', header: 'Estado', type: 'badge', align: 'center' }
  ];

  get formattedProductos(): any[] {
    const list = this.productosSignal().length > 0 ? this.productosSignal() : this.initialProductos();
    return list.map(p => ({
      ...p,
      categoriaNombre: p.categoriaNombre || p.categoriaSlug || 'General',
      stockDisplay: `${p.stock || 10} unids.`,
      estadoDisplay: (p.stock || 10) > 0 ? 'Activo' : 'Agotado'
    }));
  }

  openNewModal(): void {
    this.editingProducto.set(null);
    this.form.reset({
      nombre: '',
      categoria: 'pijamas',
      precio: 120000,
      precioPromocional: 0,
      stock: 20,
      descripcion: 'Prenda íntima confeccionada con tejidos suaves al tacto para el mayor confort.'
    });
    this.showModal.set(true);
  }

  onTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.editingProducto.set(event.row);
      this.form.patchValue({
        nombre: event.row.nombre,
        categoria: event.row.categoriaSlug || event.row.categoriaNombre || 'pijamas',
        precio: event.row.precio,
        precioPromocional: event.row.precioAnterior || 0,
        stock: event.row.stock || 10,
        descripcion: event.row.descripcion || ''
      });
      this.showModal.set(true);
    } else if (event.action === 'delete') {
      if (confirm(`¿Eliminar el producto "${event.row.nombre}" del catálogo?`)) {
        const current = this.productosSignal().length > 0 ? this.productosSignal() : this.initialProductos();
        this.productosSignal.set(current.filter(p => p.id !== event.row.id));
      }
    }
  }

  saveProducto(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const current = this.productosSignal().length > 0 ? this.productosSignal() : [...this.initialProductos()];
    const val = this.form.value;

    if (this.editingProducto()) {
      const id = this.editingProducto()!.id;
      const updated = current.map(p => p.id === id ? {
        ...p,
        nombre: val.nombre!,
        categoriaSlug: val.categoria!,
        categoriaNombre: val.categoria!,
        precio: Number(val.precio),
        precioAnterior: Number(val.precioPromocional) > 0 ? Number(val.precioPromocional) : undefined,
        stock: Number(val.stock),
        descripcion: val.descripcion!
      } : p);
      this.productosSignal.set(updated);
    } else {
      const newProd: Producto = {
        id: `p-${Date.now()}`,
        nombre: val.nombre!,
        slug: val.nombre!.toLowerCase().replace(/\s+/g, '-'),
        categoriaSlug: val.categoria!,
        categoriaNombre: val.categoria!,
        subcategoria: 'general',
        descripcion: val.descripcion!,
        descripcionCorta: val.descripcion!.slice(0, 50),
        precio: Number(val.precio),
        precioAnterior: Number(val.precioPromocional) > 0 ? Number(val.precioPromocional) : undefined,
        stock: Number(val.stock),
        imagenes: ['assets/images/placeholder.jpg'],
        tallas: ['S', 'M', 'L'],
        colores: [
          { nombre: 'Rosa', hex: '#EAC7D2' },
          { nombre: 'Negro', hex: '#111111' }
        ],
        calificacion: 5.0,
        resenas: 1,
        etiquetas: ['nuevo'],
        destacados: ['Confort premium'],
        composicion: '100% Algodón / Satén',
        cuidados: ['Lavar a mano', 'No usar blanqueador'],
        relacionadoCon: [],
        disponible: true,
        nuevo: true,
        bestseller: false
      };
      this.productosSignal.set([newProd, ...current]);
    }

    this.closeModal();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingProducto.set(null);
  }
}
