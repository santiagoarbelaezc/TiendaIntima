import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { TopBarPromocionalComponent } from './shared/top-bar-promocional/top-bar-promocional.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopBarPromocionalComponent, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly router = inject(Router);
  readonly isAdminRoute = signal(false);
  readonly isHomePage = signal(true);

  constructor() {
    this.isAdminRoute.set(this.router.url.startsWith('/admin'));
    this.isHomePage.set(this.router.url === '/' || this.router.url === '');

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url || '';
      this.isAdminRoute.set(url.startsWith('/admin'));
      this.isHomePage.set(url === '/' || url === '' || url === '/#');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

