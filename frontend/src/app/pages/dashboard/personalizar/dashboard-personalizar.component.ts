import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminService, BackupItemAdmin, GaleriaItemAdmin, SiteSettings } from '../../../services/admin.service';

@Component({
  selector: 'app-dashboard-personalizar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard-personalizar.component.html'
})
export class DashboardPersonalizarComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly activeTab = signal<'marca' | 'hero' | 'redes' | 'galeria' | 'backups'>('marca');

  // Estado de Galería
  readonly galeriaItems = signal<GaleriaItemAdmin[]>([]);
  readonly newGaleriaTitulo = signal('');
  readonly newGaleriaUrl = signal('');
  readonly loadingGaleria = signal(false);

  // Estado de Backups
  readonly backups = signal<BackupItemAdmin[]>([]);
  readonly loadingBackups = signal(false);

  readonly form = this.fb.group({
    brandName: ['', [Validators.required]],
    slogan: ['', [Validators.required]],
    topBarActive: [true],
    topBarMsg1: [''],
    topBarMsg2: [''],
    heroTitle: ['', [Validators.required]],
    heroSubtitle: ['', [Validators.required]],
    heroNotice: ['Envíos a domicilio solo en Calarcá, Quindío'],
    heroCta: ['', [Validators.required]],
    instagramUrl: ['', [Validators.required]],
    whatsappUrl: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const settings = this.adminService.siteSettings();
    this.form.patchValue({
      brandName: settings.brandName,
      slogan: settings.slogan,
      topBarActive: settings.topBarActive,
      topBarMsg1: settings.topBarMessages[0] || '',
      topBarMsg2: settings.topBarMessages[1] || '',
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      heroNotice: settings.heroNotice || 'Envíos a domicilio solo en Calarcá, Quindío',
      heroCta: settings.heroCta,
      instagramUrl: settings.instagramUrl,
      whatsappUrl: settings.whatsappUrl
    });

    this.loadGaleria();
    this.loadBackups();
  }

  setTab(tab: 'marca' | 'hero' | 'redes' | 'galeria' | 'backups'): void {
    this.activeTab.set(tab);
    if (tab === 'galeria') this.loadGaleria();
    if (tab === 'backups') this.loadBackups();
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
      heroNotice: val.heroNotice || 'Envíos a domicilio solo en Calarcá, Quindío',
      heroCta: val.heroCta!,
      instagramUrl: val.instagramUrl!,
      whatsappUrl: val.whatsappUrl!
    };

    this.adminService.saveSettings(newSettings);
    this.successMessage.set('Configuración guardada en el backend y aplicada.');
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  // --- Galería ---
  loadGaleria(): void {
    this.loadingGaleria.set(true);
    this.adminService.getGaleria().subscribe({
      next: (items) => {
        this.galeriaItems.set(items);
        this.loadingGaleria.set(false);
      },
      error: () => this.loadingGaleria.set(false)
    });
  }

  addFoto(): void {
    const titulo = this.newGaleriaTitulo().trim();
    const url = this.newGaleriaUrl().trim();

    if (!titulo || !url) {
      this.errorMessage.set('Debes ingresar un título y la URL de la imagen.');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    this.adminService.addGaleriaItem(titulo, url, this.galeriaItems().length + 1).subscribe({
      next: () => {
        this.newGaleriaTitulo.set('');
        this.newGaleriaUrl.set('');
        this.successMessage.set('Foto añadida a la galería exitosamente.');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadGaleria();
      },
      error: () => {
        this.errorMessage.set('Error al guardar la foto en el backend.');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  deleteFoto(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar esta imagen de la galería?')) return;

    this.adminService.deleteGaleriaItem(id).subscribe({
      next: () => {
        this.successMessage.set('Imagen eliminada.');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadGaleria();
      },
      error: () => {
        this.errorMessage.set('No se pudo eliminar la imagen.');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  // --- Backups ---
  loadBackups(): void {
    this.loadingBackups.set(true);
    this.adminService.getBackups().subscribe({
      next: (data) => {
        this.backups.set(data);
        this.loadingBackups.set(false);
      },
      error: () => this.loadingBackups.set(false)
    });
  }

  generarBackup(): void {
    this.loadingBackups.set(true);
    this.adminService.createBackup().subscribe({
      next: () => {
        this.successMessage.set('Copia de seguridad generada exitosamente.');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadBackups();
      },
      error: () => {
        this.errorMessage.set('Error al generar la copia de seguridad.');
        setTimeout(() => this.errorMessage.set(''), 3000);
        this.loadingBackups.set(false);
      }
    });
  }

  eliminarBackup(filename: string): void {
    if (!confirm(`¿Deseas eliminar el respaldo "${filename}"?`)) return;

    this.adminService.deleteBackup(filename).subscribe({
      next: () => {
        this.successMessage.set('Respaldo eliminado.');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadBackups();
      },
      error: () => {
        this.errorMessage.set('No se pudo eliminar el archivo.');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  downloadUrl(filename: string): string {
    return this.adminService.getBackupDownloadUrl(filename);
  }
}
