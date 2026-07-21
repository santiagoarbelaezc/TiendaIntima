import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { ProductosService } from '../../services/productos.service';
import { brandName, navigationItems, socialLinks } from '../../core/constants/brand.constants';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';
import type { Categoria } from '../../models/categoria';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MegaMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnDestroy {
  private readonly productosService = inject(ProductosService);
  private readonly router = inject(Router);
  readonly brandName = brandName;
  readonly navigationItems = navigationItems;
  readonly socialLinks = socialLinks;
  readonly categories = toSignal(this.productosService.getCategorias(), { initialValue: [] as Categoria[] });
  readonly mobileMenuOpen = signal(false);
  readonly activeMegaMenu = signal('');
  readonly showMegaMenu = computed(() => this.activeMegaMenu().length > 0);
  readonly scrolled = signal(false);
  readonly isDarkBackgroundPage = signal(true);
  private closeTimeout?: any;

  constructor() {
    this.isDarkBackgroundPage.set(this.router.url === '/' || this.router.url === '' || this.router.url === '/lenceria');

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url || '';
      this.isDarkBackgroundPage.set(url === '/' || url === '' || url === '/lenceria' || url === '/#');
      this.mobileMenuOpen.set(false);
      this.closeMegaMenu();
    });
  }

  ngOnDestroy(): void {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
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
    this.closeMegaMenu();
  }

  openMegaMenu(slug: string): void {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = undefined;
    }
    this.activeMegaMenu.set(slug);
  }

  scheduleCloseMegaMenu(): void {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
    this.closeTimeout = setTimeout(() => {
      this.activeMegaMenu.set('');
      this.closeTimeout = undefined;
    }, 180);
  }

  closeMegaMenu(): void {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = undefined;
    }
    this.activeMegaMenu.set('');
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((isOpen) => !isOpen);
  }
}