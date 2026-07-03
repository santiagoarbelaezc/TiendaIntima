import { Injectable, computed, effect, signal } from '@angular/core';

import type { Cupon } from '../models/cupon';
import type { ItemCarrito } from '../models/item-carrito';
import type { ColorOpcion, Producto } from '../models/producto';

export interface CartSelection {
  talla: string;
  color: ColorOpcion;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly storageKey = 'tiendaintima-cart';
  private readonly couponKey = 'tiendaintima-coupon';
  private readonly itemsSignal = signal<ItemCarrito[]>(this.readItems());
  private readonly couponSignal = signal<Cupon | null>(this.readCoupon());

  readonly items = computed(() => this.itemsSignal());
  readonly itemCount = computed(() => this.itemsSignal().reduce((total, item) => total + item.cantidad, 0));
  readonly subtotal = computed(() => this.itemsSignal().reduce((total, item) => total + item.precio * item.cantidad, 0));
  readonly discount = computed(() => {
    const subtotal = this.subtotal();
    const coupon = this.couponSignal();

    if (!coupon || subtotal < coupon.minimo) {
      return 0;
    }

    return coupon.tipo === 'porcentaje' ? subtotal * (coupon.valor / 100) : coupon.valor;
  });
  readonly shipping = computed(() => (this.subtotal() > 220000 ? 0 : this.itemsSignal().length > 0 ? 12000 : 0));
  readonly total = computed(() => Math.max(this.subtotal() - this.discount() + this.shipping(), 0));
  readonly appliedCoupon = computed(() => this.couponSignal());

  constructor() {
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.itemsSignal()));

      const coupon = this.couponSignal();

      if (coupon) {
        localStorage.setItem(this.couponKey, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(this.couponKey);
      }
    });
  }

  add(producto: Producto, selection: CartSelection): void {
    const existingItem = this.itemsSignal().find(
      (item) => item.productoId === producto.id && item.talla === selection.talla && item.color.hex === selection.color.hex
    );

    if (existingItem) {
      this.updateQuantity(existingItem.id, existingItem.cantidad + selection.cantidad);
      return;
    }

    const item: ItemCarrito = {
      id: `${producto.id}-${selection.talla}-${selection.color.hex}`,
      productoId: producto.id,
      slug: producto.slug,
      nombre: producto.nombre,
      imagen: producto.imagenes[0],
      precio: producto.precio,
      cantidad: selection.cantidad,
      talla: selection.talla,
      color: selection.color
    };

    this.itemsSignal.update((items) => [...items, item]);
  }

  updateQuantity(itemId: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.remove(itemId);
      return;
    }

    this.itemsSignal.update((items) => items.map((item) => (item.id === itemId ? { ...item, cantidad } : item)));
  }

  updateSize(itemId: string, talla: string): void {
    this.itemsSignal.update((items) => items.map((item) => (item.id === itemId ? { ...item, talla } : item)));
  }

  updateColor(itemId: string, color: ColorOpcion): void {
    this.itemsSignal.update((items) => items.map((item) => (item.id === itemId ? { ...item, color } : item)));
  }

  remove(itemId: string): void {
    this.itemsSignal.update((items) => items.filter((item) => item.id !== itemId));
  }

  clear(): void {
    this.itemsSignal.set([]);
    this.clearCoupon();
  }

  applyCoupon(coupon: Cupon | null): void {
    this.couponSignal.set(coupon);
  }

  clearCoupon(): void {
    this.couponSignal.set(null);
  }

  private readItems(): ItemCarrito[] {
    const storedItems = localStorage.getItem(this.storageKey);

    if (!storedItems) {
      return [];
    }

    try {
      return JSON.parse(storedItems) as ItemCarrito[];
    } catch {
      return [];
    }
  }

  private readCoupon(): Cupon | null {
    const storedCoupon = localStorage.getItem(this.couponKey);

    if (!storedCoupon) {
      return null;
    }

    try {
      return JSON.parse(storedCoupon) as Cupon;
    } catch {
      return null;
    }
  }
}