import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ENV_CONFIG } from '@core/config';
import type { EnvironmentConfig } from '@core/config';
import type { PaymentSheetResponse } from '@features/shop/models';

/**
 * Service PaymentApiService
 * @class PaymentApiService
 *
 * @description
 * Data-access layer of the "shop" feature: pure transport to the Stripe backend.
 * Returns transport types only — no Stripe SDK logic here.
 *
 * No API Platform / Hydra backend here (only Stripe), so `HttpClient` is used
 * directly (a documented deviation from a `HydraApiService` base).
 *
 * @version 1.0.0
 *
 * @author Valentin FORTIN <contact@valentin-fortin.pro>
 */
@Injectable()
export class PaymentApiService {
  //#region Properties
  /**
   * Property http
   * @readonly
   *
   * @description
   * Angular HTTP client.
   *
   * @access private
   * @since 1.0.0
   *
   * @type {HttpClient}
   */
  private readonly http: HttpClient = inject<HttpClient>(HttpClient);

  /**
   * Property env
   * @readonly
   *
   * @description
   * Application environment (backend base URL).
   *
   * @access private
   * @since 1.0.0
   *
   * @type {EnvironmentConfig}
   */
  private readonly env: EnvironmentConfig = inject<EnvironmentConfig>(ENV_CONFIG);
  //#endregion

  //#region Methods
  /**
   * Method createPaymentSheet
   * @method createPaymentSheet
   *
   * @description
   * Requests a fresh PaymentSheet payload (customer, ephemeral key, intent) from
   * the backend.
   *
   * @access public
   * @since 1.0.0
   *
   * @returns {Promise<PaymentSheetResponse>} The PaymentSheet initialization payload.
   */
  public createPaymentSheet(): Promise<PaymentSheetResponse> {
    return firstValueFrom(this.http.post<PaymentSheetResponse>(`${this.env.api}payment-sheet`, {}));
  }
  //#endregion
}
