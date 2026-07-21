import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '../../components/button/button.component';
import { AuthService } from '../../services/auth.service';

interface AuthSlide {
  image: string;
  title: string;
  message: string;
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly mode = signal<'login' | 'registro' | 'recuperar'>('login');
  readonly activeSlide = signal(0);
  private slideTimer: any;

  readonly slides: AuthSlide[] = [
    {
      image: 'assets/images/hero_novedades_1.png',
      title: 'Comunidad Tiendaintima',
      message: 'Ingresa con nosotros para obtener descuentos exclusivos'
    },
    {
      image: 'assets/images/pijamas-hero-2.png',
      title: 'Beneficios de Bienvenida',
      message: 'Regístrate en Tienda Intima para obtener descuentos exclusivos'
    },
    {
      image: 'assets/images/galeria_4.png',
      title: 'Elegancia & Descanso',
      message: 'Tejidos nobles, satén de seda y algodón nublado pensados para tus momentos de paz y autocuidado en casa.'
    }
  ];

  // Señales para mensajes
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly recoveryMessage = signal('');

  // Formularios
  readonly loginForm = this.fb.group({
    email: ['laura@demo.com', [Validators.required, Validators.email]],
    password: ['123456', [Validators.required]]
  });

  readonly registerForm = this.fb.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly recoveryForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    // Si viene parámetro en la ruta o query para iniciar en modo específico
    const qpMode = this.route.snapshot.queryParamMap.get('mode');
    if (qpMode === 'registro' || qpMode === 'recuperar' || qpMode === 'login') {
      this.mode.set(qpMode);
    }

    this.startSlideTimer();
  }

  ngOnDestroy(): void {
    this.stopSlideTimer();
  }

  private startSlideTimer(): void {
    this.stopSlideTimer();
    this.slideTimer = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  private stopSlideTimer(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.slideTimer = null;
    }
  }

  setMode(newMode: 'login' | 'registro' | 'recuperar'): void {
    this.mode.set(newMode);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.recoveryMessage.set('');
    // Si cambia al modo registro, sincronizar el texto del carrusel a la slide de registro (slide 1)
    if (newMode === 'registro' && this.activeSlide() !== 1) {
      this.activeSlide.set(1);
    } else if (newMode === 'login' && this.activeSlide() !== 0) {
      this.activeSlide.set(0);
    }
    this.startSlideTimer();
  }

  nextSlide(): void {
    this.activeSlide.update((current) => (current + 1) % this.slides.length);
  }

  prevSlide(): void {
    this.activeSlide.update((current) => (current - 1 + this.slides.length) % this.slides.length);
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.slides.length) {
      this.activeSlide.set(index);
      this.startSlideTimer();
    }
  }

  submitLogin(): void {
    const email = (this.loginForm.value.email ?? '').trim();
    const password = (this.loginForm.value.password ?? '').trim();

    // Acceso directo a admin si dejan vacío (lógica demo preexistente)
    if (!email && !password) {
      this.authService.loginAsAdminDemo().subscribe(() => {
        this.router.navigateByUrl('/admin');
      });
      return;
    }

    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.errorMessage.set('');
    this.authService.login(email, password).subscribe({
      next: (user) => {
        const defaultUrl = user.rol === 'admin' ? '/admin' : '/mi-cuenta';
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? defaultUrl;
        this.router.navigateByUrl(returnUrl);
      },
      error: () => this.errorMessage.set('No pudimos validar esos datos de acceso. Por favor verifica tu correo y contraseña.')
    });
  }

  submitRegister(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    this.authService.register({
      nombre: this.registerForm.value.nombre ?? '',
      email: this.registerForm.value.email ?? '',
      telefono: this.registerForm.value.telefono ?? '',
      password: this.registerForm.value.password ?? ''
    }).subscribe(() => {
      this.successMessage.set('Tu cuenta ha sido creada exitosamente. Ya puedes continuar con tus compras.');
      setTimeout(() => {
        this.router.navigateByUrl('/mi-cuenta');
      }, 1200);
    });
  }

  submitRecovery(): void {
    this.recoveryForm.markAllAsTouched();
    if (this.recoveryForm.invalid) return;

    // Simulación elegante de envío de recuperación
    const email = this.recoveryForm.value.email ?? '';
    this.recoveryMessage.set(`Hemos enviado un enlace seguro para restablecer tu contraseña a ${email}. Revisa tu bandeja de entrada.`);
  }
}
