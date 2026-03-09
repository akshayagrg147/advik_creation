import fetchApi from './client';

export interface CheckoutSettings {
  codEnabled: boolean;
}

export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  try {
    return await fetchApi<CheckoutSettings>('/settings/checkout');
  } catch {
    return { codEnabled: true };
  }
}
