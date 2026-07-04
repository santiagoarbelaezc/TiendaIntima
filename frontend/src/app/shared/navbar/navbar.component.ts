import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { ProductosService } from '../../services/productos.service';
import { brandName, navigationItems } from '../../core/constants/brand.constants';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';
import type { Categoria } from '../../models/categoria';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MegaMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private readonly productosService = inject(ProductosService);
  private readonly router = inject(Router);
  readonly brandName = brandName;
  readonly navigationItems = navigationItems;
  readonly categories = toSignal(this.productosService.getCategorias(), { initialValue: [] as Categoria[] });
  readonly mobileMenuOpen = signal(false);
  readonly activeMegaMenu = signal('');
  readonly showMegaMenu = computed(() => this.activeMegaMenu().length > 0);
  readonly scrolled = signal(false);
  readonly isHomePage = signal(true);

  constructor() {
    this.isHomePage.set(this.router.url === '/' || this.router.url === '');

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url || '';
      this.isHomePage.set(url === '/' || url === '' || url === '/#');
    });
  }


  @HostListener('window:scroll')
  onScroll(): void {
    if (typeof window !== 'undefined') {
      this.scrolled.set(window.scrollY > 40);
    }
  }

  @HostListener('document:keydown.escape')
  closeMenus(): void {
    this.mobileMenuOpen.set(false);
    this.activeMegaMenu.set('');
  }

  openMegaMenu(slug: string): void {
    this.activeMegaMenu.set(slug);
  }

  closeMegaMenu(): void {
    this.activeMegaMenu.set('');
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((isOpen) => !isOpen);
  }
}