import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Registers <pwa-camera-modal> in the DOM (web photo capture, Camera 8).
import './app/shared/components/camera-modal/camera-modal.element';

// Payments use the Stripe Payment Element in our own sheet (see PaymentSheetComponent),
// so the stripe-pwa-elements web fallback is no longer wired here.
void bootstrapApplication(AppComponent, appConfig);
