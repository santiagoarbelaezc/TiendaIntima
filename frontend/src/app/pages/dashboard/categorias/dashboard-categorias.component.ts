import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { ProductosService } from '../../../services/productos.service';
import { Categoria } from '../../../models/categoria';

@Component({
  selector: 'app-dashboard-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-categorias.component.html'
})
export class DashboardCategoriasComponent {
  private readonly productosService = inject(ProductosService);
  private readonly fb = inject(FormBuilder);

  readonly initialCategorias = toSignal(this.productosService.getCategorias(), { initialValue: [] });
  readonly categoriasSignal = signal<Categoria[]>([]);
  readonly showModal = signal(false);
  readonly editingCategoria = signal<Categoria | null>(null);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    imagen: ['assets/images/placeholder-category.jpg', [Validators.required]]
  });

  get currentCategorias(): Categoria[] {
    return this.categoriasSignal().length > 0 ? this.categoriasSignal() : this.initialCategorias();
  }

  openNewModal(): void {
    this.editingCategoria.set(null);
    this.form.reset({
      nombre: '',
      descripcion: 'Colección especial con las mejores texturas.',
      imagen: 'assets/images/cat-default.jpg'
    });
    this.showModal.set(true);
  }

  editCat(cat: Categoria): void {
    this.editingCategoria.set(cat);
    this.form.patchValue({
      nombre: cat.nombre,
      descripcion: cat.descripcion || '',
      imagen: cat.imagen || 'assets/images/cat-default.jpg'
    });
    this.showModal.set(true);
  }

  deleteCat(cat: Categoria): void {
    if (confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) {
      const current = this.currentCategorias;
      this.categoriasSignal.set(current.filter(c => c.id !== cat.id));
    }
  }

  saveCategoria(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const current = [...this.currentCategorias];
    const val = this.form.value;

    if (this.editingCategoria()) {
      const id = this.editingCategoria()!.id;
      const updated = current.map(c => c.id === id ? {
        ...c,
        nombre: val.nombre!,
        slug: val.nombre!.toLowerCase().replace(/\s+/g, '-'),
        descripcion: val.descripcion!,
        imagen: val.imagen!,
        acento: c.acento || '#EAC7D2',
        subcategorias: c.subcategorias || []
      } : c);
      this.categoriasSignal.set(updated);
    } else {
      const newCat: Categoria = {
        id: `cat-${Date.now()}`,
        nombre: val.nombre!,
        slug: val.nombre!.toLowerCase().replace(/\s+/g, '-'),
        descripcion: val.descripcion!,
        imagen: val.imagen!,
        acento: '#EAC7D2',
        subcategorias: []
      };
      this.categoriasSignal.set([...current, newCat]);
    }

    this.closeModal();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCategoria.set(null);
  }
}
