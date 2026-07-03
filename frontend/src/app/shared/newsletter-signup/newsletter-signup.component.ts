import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  submit(): void {
    this.form.markAllAsTouched();
  }
}