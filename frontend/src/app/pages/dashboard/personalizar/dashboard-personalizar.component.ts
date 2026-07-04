import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminService, SiteSettings } from '../../../services/admin.service';

@Component({
  selector: 'app-dashboard-personalizar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-personalizar.component.html'
})
export class DashboardPersonalizarComponent {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  readonly successMessage = signal('');
  readonly activeTab = signal<'marca' | 'hero' | 'redes'>('marca');

  readonly form = this.fb.group({
    brandName: ['', [Validators.required]],
    slogan: ['', [Validators.required]],
    topBarActive: [true],
    topBarMsg1: [''],
    topBarMsg2: [''],
    heroTitle: ['', [Validators.required]],
    heroSubtitle: ['', [Validators.required]],
    heroCta: ['', [Validators.required]],
    instagramUrl: ['', [Validators.required]],
    whatsappUrl: ['', [Validators.required]]
  });

  constructor() {
    const settings = this.adminService.siteSettings();
    this.form.patchValue({
      brandName: settings.brandName,
      slogan: settings.slogan,
      topBarActive: settings.topBarActive,
      topBarMsg1: settings.topBarMessages[0] || '',
      topBarMsg2: settings.topBarMessages[1] || '',
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      heroCta: settings.heroCta,
      instagramUrl: settings.instagramUrl,
      whatsappUrl: settings.whatsappUrl
    });
  }

  setTab(tab: 'marca' | 'hero' | 'redes'): void {
    this.activeTab.set(tab);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const newSettings: SiteSettings = {
      brandName: val.brandName!,
      slogan: val.slogan!,
      topBarActive: !!val.topBarActive,
      topBarMessages: [val.topBarMsg1!, val.topBarMsg2!].filter(Boolean),
      heroTitle: val.heroTitle!,
      heroSubtitle: val.heroSubtitle!,
      heroCta: val.heroCta!,
      instagramUrl: val.instagramUrl!,
      whatsappUrl: val.whatsappUrl!
    };

    this.adminService.saveSettings(newSettings);
    this.successMessage.set('Configuración guardada correctamente y aplicada a la tienda.');
    
    setTimeout(() => {
      this.successMessage.set('');
    }, 4000);
  }
}
