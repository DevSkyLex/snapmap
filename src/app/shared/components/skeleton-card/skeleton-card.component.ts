import { Component } from '@angular/core';
import { IonSkeletonText } from '@ionic/angular/standalone';

/**
 * Component SkeletonCardComponent
 * @class SkeletonCardComponent
 *
 * @description
 * Generic, domain-agnostic UI primitive: a square skeleton card shown during a
 * loading state (challenge 4). No feature coupling.
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-skeleton-card',
  template: `<div class="skeleton"><ion-skeleton-text [animated]="true"></ion-skeleton-text></div>`,
  styles: [
    `
      .skeleton {
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
      }
      ion-skeleton-text {
        width: 100%;
        height: 100%;
        margin: 0;
      }
    `,
  ],
  imports: [IonSkeletonText],
})
export class SkeletonCardComponent {}
