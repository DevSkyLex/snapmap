import { InjectionToken } from '@angular/core';
import type { EnvironmentConfig } from '@core/config/environment/environment-config.interface';

/**
 * InjectionToken ENV_CONFIG
 *
 * @description
 * Token used to inject the typed environment configuration
 * ({@link EnvironmentConfig}) instead of importing `environment` directly.
 * Bound to the current environment value by {@link provideEnvironment}.
 *
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * private readonly env: EnvironmentConfig = inject<EnvironmentConfig>(ENV_CONFIG);
 * ```
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
export const ENV_CONFIG: InjectionToken<EnvironmentConfig> = new InjectionToken<EnvironmentConfig>(
  'ENV_CONFIG',
);
