import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-newsletter-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './newsletter-signup.component.html',
  styleUrl: './newsletter-signup.component.scss'
})
export class NewsletterSignupComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit(): void {
    this.form.markAllAsTouched();
  }
}