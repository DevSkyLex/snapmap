import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ENV_CONFIG } from '@core/config/environment/env.token';
import { environment } from '@env/environment';

/**
 * Provider provideEnvironment
 *
 * @description
 * Binds the current environment value (replaced by `environment.prod.ts` in
 * production through `fileReplacements`) to the {@link ENV_CONFIG} token.
 *
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideEnvironment()],
 * };
 * ```
 *
 * @returns {EnvironmentProviders} The environment providers for {@link ENV_CONFIG}.
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export function provideEnvironment(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: ENV_CONFIG, useValue: environment }]);
}
