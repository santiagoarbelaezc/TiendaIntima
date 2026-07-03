import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{ path: '', loadComponent: () => import('./pages/home/home-page.component').then((m) => m.HomePageComponent) },
	{ path: 'catalogo', loadComponent: () => import('./pages/catalogo/catalogo-page.component').then((m) => m.CatalogoPageComponent) },
	{ path: 'producto/:slug', loadComponent: () => import('./pages/producto-detalle/producto-detalle-page.component').then((m) => m.ProductoDetallePageComponent) },
	{ path: 'carrito', loadComponent: () => import('./pages/carrito/carrito-page.component').then((m) => m.CarritoPageComponent) },
	{ path: 'checkout', loadComponent: () => import('./pages/checkout/checkout-page.component').then((m) => m.CheckoutPageComponent) },
	{ path: 'mi-cuenta', canActivate: [authGuard], loadComponent: () => import('./pages/mi-cuenta/mi-cuenta-page.component').then((m) => m.MiCuentaPageComponent) },
	{ path: 'login', loadComponent: () => import('./pages/login/login-page.component').then((m) => m.LoginPageComponent) },
	{ path: 'registro', loadComponent: () => import('./pages/registro/registro-page.component').then((m) => m.RegistroPageComponent) },
	{ path: 'nosotros', loadComponent: () => import('./pages/nosotros/nosotros-page.component').then((m) => m.NosotrosPageComponent) },
	{ path: 'contacto', loadComponent: () => import('./pages/contacto/contacto-page.component').then((m) => m.ContactoPageComponent) },
	{ path: '**', redirectTo: '' }
];
