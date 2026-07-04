import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '../../components/button/button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly errorMessage = signal('');
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submit(): void {
    const email = (this.form.value.email ?? '').trim();
    const password = (this.form.value.password ?? '').trim();

    // Si toca ingresar sin llenar datos, llevar al dashboard automáticamente como admin
    if (!email && !password) {
      this.authService.loginAsAdminDemo().subscribe(() => {
        this.router.navigateByUrl('/admin');
      });
      return;
    }

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.authService.login(this.form.value.email ?? '', this.form.value.password ?? '').subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/mi-cuenta';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => this.errorMessage.set('No pudimos validar esos datos de acceso.')
    });
  }
}
