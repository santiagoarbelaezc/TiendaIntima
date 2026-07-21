import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  queryParams?: Record<string, string>;
  exact?: boolean;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './mobile-bottom-nav.component.html',
  styleUrl: './mobile-bottom-nav.component.scss'
})
export class MobileBottomNavComponent {
  readonly navItems: NavItem[] = [
    {
      label: 'Inicio',
      path: '/',
      exact: true,
      icon: 'home'
    },
    {
      label: 'Catálogo',
      path: '/catalogo',
      exact: true,
      icon: 'grid'
    },
    {
      label: 'Novedades',
      path: '/catalogo',
      queryParams: { filter: 'nuevo' },
      icon: 'sparkles'
    },
    {
      label: 'Carrito',
      path: '/carrito',
      icon: 'cart',
      badge: 0
    },
    {
      label: 'Mi Cuenta',
      path: '/login',
      icon: 'user'
    }
  ];
}
