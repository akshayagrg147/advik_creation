import fetchApi from './client';

export interface CheckoutSettings {
  codEnabled: boolean;
  partialCodEnabled: boolean;
  partialCodAdvanceAmount: string;
  prepaidDiscountPercent: string;
  shippingCost: string;
  freeShippingThreshold: string;
}

export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  try {
    return await fetchApi<CheckoutSettings>('/settings/checkout');
  } catch {
    return {
      codEnabled: false,
      partialCodEnabled: true,
      partialCodAdvanceAmount: '99',
      prepaidDiscountPercent: '5',
      shippingCost: '50',
      freeShippingThreshold: '1000',
    };
  }
}
