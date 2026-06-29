import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements as defineStripeElements } from 'stripe-pwa-elements/loader';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Registers <pwa-camera-modal> in the DOM (web photo capture, Camera 8).
import './app/shared/components/camera-modal/camera-modal.element';

void bootstrapApplication(AppComponent, {...appConfig, providers: [provideZoneChangeDetection(), ...appConfig.providers]}).then(() => {
  // Stripe PaymentSheet on the browser (ionic serve) — maintained and compatible.
  defineStripeElements(globalThis.window);
});
