export const brandName = 'Tiendaintima';

export const topBarMessages = [
  'Envíos a domicilio exclusivos en Calarcá, Quindío',
  'Nueva colección de pijamas y descanso',
  'Promo especial: 10% OFF en tu primera compra'
];

export interface NavigationItem {
  label: string;
  path: string;
  category?: string;
  filter?: string;
}

export const navigationItems: NavigationItem[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Catálogo', path: '/catalogo' },
  { label: 'Galería', path: '/galeria' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Contacto', path: '/contacto' }
];

export const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/tiendaintima' },
  { label: 'WhatsApp', href: 'https://wa.me/573001234567' }
];

export const footerLinks = [
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Contacto', path: '/contacto' },
  { label: 'Galería', path: '/galeria' }
];

export const legalLinks = [
  { label: 'Tratamiento de Datos', path: '/tratamiento-datos' },
  { label: 'Política de Envío', path: '/politica-envio' }
];