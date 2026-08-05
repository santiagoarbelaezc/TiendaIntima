import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export interface CookieConsentPayload {
  v: number;
  timestamp: string;
  acceptedAll: boolean;
  essentialOnly: boolean;
  preferences: CookiePreferences;
}

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.scss'
})
export class CookieConsentComponent implements OnInit {
  readonly STORAGE_KEY = 'app_cookie_consent_v1';

  readonly isVisible = signal<boolean>(false);
  readonly isModalOpen = signal<boolean>(false);
  readonly activeTab = signal<'preferences' | 'legal'>('preferences');

  // Preferences toggles
  readonly analytics = signal<boolean>(true);
  readonly functional = signal<boolean>(true);
  readonly marketing = signal<boolean>(false);

  ngOnInit(): void {
    this.checkExistingConsent();
  }

  private checkExistingConsent(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        this.isVisible.set(true);
        return;
      }

      const parsed: CookieConsentPayload = JSON.parse(stored);
      if (parsed && parsed.preferences) {
        this.analytics.set(!!parsed.preferences.analytics);
        this.functional.set(!!parsed.preferences.functional);
        this.marketing.set(!!parsed.preferences.marketing);
        this.isVisible.set(false);
      } else {
        this.isVisible.set(true);
      }
    } catch {
      this.isVisible.set(true);
    }
  }

  acceptAll(): void {
    this.analytics.set(true);
    this.functional.set(true);
    this.marketing.set(true);

    this.saveConsent({
      v: 1,
      timestamp: new Date().toISOString(),
      acceptedAll: true,
      essentialOnly: false,
      preferences: {
        necessary: true,
        analytics: true,
        functional: true,
        marketing: true
      }
    });
  }

  acceptEssential(): void {
    this.analytics.set(false);
    this.functional.set(false);
    this.marketing.set(false);

    this.saveConsent({
      v: 1,
      timestamp: new Date().toISOString(),
      acceptedAll: false,
      essentialOnly: true,
      preferences: {
        necessary: true,
        analytics: false,
        functional: false,
        marketing: false
      }
    });
  }

  savePreferences(): void {
    this.saveConsent({
      v: 1,
      timestamp: new Date().toISOString(),
      acceptedAll: this.analytics() && this.functional() && this.marketing(),
      essentialOnly: !this.analytics() && !this.functional() && !this.marketing(),
      preferences: {
        necessary: true,
        analytics: this.analytics(),
        functional: this.functional(),
        marketing: this.marketing()
      }
    });
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  selectTab(tab: 'preferences' | 'legal'): void {
    this.activeTab.set(tab);
  }

  toggleAnalytics(): void {
    this.analytics.set(!this.analytics());
  }

  toggleFunctional(): void {
    this.functional.set(!this.functional());
  }

  toggleMarketing(): void {
    this.marketing.set(!this.marketing());
  }

  private saveConsent(payload: CookieConsentPayload): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('No se pudo guardar la preferencia de cookies en localStorage', e);
    }
    this.isVisible.set(false);
    this.isModalOpen.set(false);
  }
}
