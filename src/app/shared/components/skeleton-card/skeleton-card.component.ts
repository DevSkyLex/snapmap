import { Component } from '@angular/core';

/**
 * Component SkeletonCardComponent
 * @class SkeletonCardComponent
 *
 * @description
 * Generic, domain-agnostic UI primitive: a square shimmering placeholder shown
 * during a loading state (challenge 4). No feature coupling. The shimmer sweeps
 * a gradient and collapses to a static surface under reduced-motion.
 *
 * @version 1.1.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Component({
  selector: 'app-skeleton-card',
  template: `<div class="skeleton"></div>`,
  styles: [
    `
      :host {
        display: block;
      }

      .skeleton {
        aspect-ratio: 1;
        background: linear-gradient(
          100deg,
          var(--bg-grouped, #fafafa) 30%,
          var(--separator, #dbdbdb) 50%,
          var(--bg-grouped, #fafafa) 70%
        );
        background-size: 200% 100%;
        animation: skeleton-shimmer 1.3s ease infinite;
      }

      @keyframes skeleton-shimmer {
        from {
          background-position: 200% 0;
        }
        to {
          background-position: -200% 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .skeleton {
          animation: none;
        }
      }
    `,
  ],
})
export class SkeletonCardComponent {}
