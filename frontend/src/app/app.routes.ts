import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
	{ path: '', loadComponent: () => import('./pages/home/home-page.component').then((m) => m.HomePageComponent) },
	{ path: 'catalogo', loadComponent: () => import('./pages/catalogo/catalogo-page.component').then((m) => m.CatalogoPageComponent) },
	{ path: 'lenceria', loadComponent: () => import('./pages/lenceria/lenceria-page.component').then((m) => m.LenceriaPageComponent) },
	{ path: 'producto/:slug', loadComponent: () => import('./pages/producto-detalle/producto-detalle-page.component').then((m) => m.ProductoDetallePageComponent) },
	{ path: 'carrito', loadComponent: () => import('./pages/carrito/carrito-page.component').then((m) => m.CarritoPageComponent) },
	{ path: 'checkout', loadComponent: () => import('./pages/checkout/checkout-page.component').then((m) => m.CheckoutPageComponent) },
	{ path: 'mi-cuenta', canActivate: [authGuard], loadComponent: () => import('./pages/mi-cuenta/mi-cuenta-page.component').then((m) => m.MiCuentaPageComponent) },
	{ path: 'login', loadComponent: () => import('./pages/login/login-page.component').then((m) => m.LoginPageComponent) },
	{ path: 'registro', loadComponent: () => import('./pages/registro/registro-page.component').then((m) => m.RegistroPageComponent) },
	{ path: 'nosotros', loadComponent: () => import('./pages/nosotros/nosotros-page.component').then((m) => m.NosotrosPageComponent) },
	{ path: 'contacto', loadComponent: () => import('./pages/contacto/contacto-page.component').then((m) => m.ContactoPageComponent) },
	{
		path: 'admin',
		canActivate: [adminGuard],
		loadComponent: () => import('./shared/dashboard-layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
		children: [
			{ path: '', loadComponent: () => import('./pages/dashboard/inicio/dashboard-inicio.component').then((m) => m.DashboardInicioComponent) },
			{ path: 'analiticas', loadComponent: () => import('./pages/dashboard/analiticas/dashboard-analiticas.component').then((m) => m.DashboardAnaliticasComponent) },
			{ path: 'usuarios', loadComponent: () => import('./pages/dashboard/usuarios/dashboard-usuarios.component').then((m) => m.DashboardUsuariosComponent) },
			{ path: 'productos', loadComponent: () => import('./pages/dashboard/productos/dashboard-productos.component').then((m) => m.DashboardProductosComponent) },
			{ path: 'categorias', loadComponent: () => import('./pages/dashboard/categorias/dashboard-categorias.component').then((m) => m.DashboardCategoriasComponent) },
			{ path: 'personalizar', loadComponent: () => import('./pages/dashboard/personalizar/dashboard-personalizar.component').then((m) => m.DashboardPersonalizarComponent) },
			{ path: 'reportes', loadComponent: () => import('./pages/dashboard/reportes/dashboard-reportes.component').then((m) => m.DashboardReportesComponent) }
		]
	},
	{ path: '**', redirectTo: '' }
];

