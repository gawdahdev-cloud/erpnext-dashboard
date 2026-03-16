import { FrappeApp } from 'frappe-js-sdk';

/**
 * إنشاء Frappe instance من الـ config
 * في الـ dev mode: يستخدم الـ Vite Proxy تلقائياً (بيحل مشكلة CORS)
 * في الـ production: يستخدم الرابط الكامل
 */
export function createFrappe(config) {
  // في الـ development مع Vite → الـ proxy بيمسح مشكلة CORS
  const baseUrl = import.meta.env.DEV
    ? window.location.origin
    : config.url;

  return new FrappeApp(baseUrl, {
    useToken: true,
    token: () => `token ${config.apiKey}:${config.apiSecret}`,
    type: 'token',
  });
}

/**
 * تنسيق الأرقام بالاختصار
 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—';
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}م`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}ك`;
  return Math.round(amount).toLocaleString('ar-EG');
}
