import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { ButtonComponent } from '../../components/button/button.component';
import { MapaUbicacionComponent } from '../../shared/mapa-ubicacion/mapa-ubicacion.component';

export type SectionSlug = 'tratamiento-datos' | 'politica-envio' | 'soporte-garantias' | 'acerca-tienda';

interface NavSection {
  slug: SectionSlug;
  title: string;
  subtitle: string;
  path: string;
}

@Component({
  selector: 'app-legal-ayuda-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, MapaUbicacionComponent],
  templateUrl: './legal-ayuda-page.component.html',
  styleUrl: './legal-ayuda-page.component.scss'
})
export class LegalAyudaPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private routeSub?: Subscription;

  readonly activeSection = signal<SectionSlug>('tratamiento-datos');
  readonly successMessage = signal('');

  readonly sections: NavSection[] = [
    {
      slug: 'tratamiento-datos',
      title: 'Tratamiento de Datos',
      subtitle: 'Privacidad y protección legal de tu información',
      path: '/tratamiento-datos'
    },
    {
      slug: 'politica-envio',
      title: 'Política de Envío',
      subtitle: 'Cobertura, tiempos de entrega y discreción',
      path: '/politica-envio'
    },
    {
      slug: 'soporte-garantias',
      title: 'Soporte y Garantías',
      subtitle: 'Atención al cliente, cambios y cuidados',
      path: '/contacto'
    },
    {
      slug: 'acerca-tienda',
      title: 'Acerca de la Tienda',
      subtitle: 'Filosofía, curaduría y manifiesto íntimo',
      path: '/nosotros'
    }
  ];

  readonly form = this.fb.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    mensaje: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    // Escuchar cambios en la ruta o en la data para enfocar la sección solicitada
    this.routeSub = this.route.data.subscribe((data) => {
      if (data['section']) {
        this.activeSection.set(data['section'] as SectionSlug);
      } else {
        const querySec = this.route.snapshot.queryParamMap.get('seccion') as SectionSlug;
        if (querySec && this.sections.some(s => s.slug === querySec)) {
          this.activeSection.set(querySec);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  selectSection(slug: SectionSlug): void {
    this.activeSection.set(slug);
    const target = this.sections.find(s => s.slug === slug);
    if (target) {
      this.router.navigateByUrl(target.path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  submitContact(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.successMessage.set('Tu mensaje ha sido recibido por nuestro equipo de atención. Te contactaremos a la brevedad posible.');
    this.form.reset();
  }
}
