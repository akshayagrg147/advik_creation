import fetchApi from './client';

export async function sendOtp(email: string): Promise<{ success: boolean; message: string }> {
  return fetchApi('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, otp: string): Promise<{ success: boolean; email: string; token: string }> {
  return fetchApi('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}
