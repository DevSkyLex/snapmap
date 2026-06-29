import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { FeedbackService } from '@core/feedback/services/feedback/feedback.service';

/**
 * Provider provideFeedback
 *
 * @description
 * Provisions the {@link FeedbackService} at the application composition root,
 * in accordance with the "no `providedIn: 'root'`" rule.
 *
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideFeedback()],
 * };
 * ```
 *
 * @returns {EnvironmentProviders} The providers exposing {@link FeedbackService}.
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export function provideFeedback(): EnvironmentProviders {
  return makeEnvironmentProviders([FeedbackService]);
}
