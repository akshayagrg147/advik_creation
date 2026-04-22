import fetchApi from './client';

export interface Settings {
  codEnabled: boolean;
  partialCodEnabled: boolean;
  partialCodAdvanceAmount: string;
  prepaidDiscountPercent: string;
  siteName: string;
  siteEmail: string;
  sitePhone: string;
  currency: string;
  taxRate: string;
  shippingCost: string;
  freeShippingThreshold: string;
}

export async function getSettings(): Promise<Settings> {
  return fetchApi<Settings>('/settings');
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
  return fetchApi<Settings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
