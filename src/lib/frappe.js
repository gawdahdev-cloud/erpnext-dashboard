import { FrappeApp } from 'frappe-js-sdk';

// ================================================================
// الـ instances بتيجي من vite.config.js عبر define
// كل instance ليه proxyBase خاص بيه:
//   centre   → /proxy/centre/api/...
//   pharma   → /proxy/pharma/api/...
// ================================================================
export const INSTANCES = typeof __INSTANCES__ !== 'undefined' ? __INSTANCES__ : [];

// instance المركز دايمًا أول واحد في القائمة
export const CENTRE_INSTANCE = INSTANCES.find(i => i.id === 'centre') || INSTANCES[0];

/**
 * بيعمل FrappeApp لـ instance معين
 * baseUrl = الـ proxy prefix — بيحل CORS تلقائياً
 */
export function makeFrappe(instance) {
  const baseUrl = `${window.location.origin}${instance.proxyBase}`;
  return new FrappeApp(baseUrl, {
    useToken: true,
    token: () => `token ${instance.apiKey}:${instance.apiSecret}`,
    type: 'token',
  });
}

/**
 * Login بـ username/password على المركز
 * بيرجع الـ user object لو نجح أو بيرمي error
 */
export async function loginWithCentre(username, password) {
  const baseUrl = `${window.location.origin}${CENTRE_INSTANCE.proxyBase}`;
  const frappe = new FrappeApp(baseUrl);
  const authApi = frappe.auth();
  await authApi.loginWithUsernamePassword({ username, password });
  const user = await authApi.getLoggedInUser();
  return user;
}

/**
 * Logout من المركز
 */
export async function logoutFromCentre() {
  const baseUrl = `${window.location.origin}${CENTRE_INSTANCE.proxyBase}`;
  const frappe = new FrappeApp(baseUrl);
  await frappe.auth().logout();
}

/**
 * جلب إحصائيات instance واحد
 */
export async function fetchInstanceStats(instance) {
  const frappe = makeFrappe(instance);
  const db = frappe.db();
  const year = new Date().getFullYear();
  const startOfYear = `${year}-01-01`;

  const [salesInvoices, purchaseInvoices] = await Promise.all([
    db.getDocList('Sales Invoice', {
      filters: [
        ['docstatus', '=', 1],
        ['posting_date', '>=', startOfYear],
      ],
      fields: ['name', 'grand_total', 'outstanding_amount', 'status', 'posting_date', 'customer_name'],
      orderBy: { field: 'posting_date', order: 'desc' },
      limit: 500,
    }),
    db.getDocList('Purchase Invoice', {
      filters: [
        ['docstatus', '=', 1],
        ['posting_date', '>=', startOfYear],
      ],
      fields: ['name', 'grand_total', 'outstanding_amount', 'status', 'posting_date', 'supplier_name'],
      orderBy: { field: 'posting_date', order: 'desc' },
      limit: 500,
    }),
  ]);

  const totalSales     = salesInvoices.reduce((s, i) => s + (i.grand_total || 0), 0);
  const totalPurchase  = purchaseInvoices.reduce((s, i) => s + (i.grand_total || 0), 0);
  const paidSales      = salesInvoices.filter(i => i.status === 'Paid')
                                      .reduce((s, i) => s + (i.grand_total || 0), 0);

  // تجميع شهري
  const monthlyMap = {};
  for (const inv of salesInvoices) {
    if (!inv.posting_date) continue;
    const m = inv.posting_date.slice(0, 7);
    if (!monthlyMap[m]) monthlyMap[m] = { sales: 0, purchase: 0 };
    monthlyMap[m].sales += inv.grand_total || 0;
  }
  for (const inv of purchaseInvoices) {
    if (!inv.posting_date) continue;
    const m = inv.posting_date.slice(0, 7);
    if (!monthlyMap[m]) monthlyMap[m] = { sales: 0, purchase: 0 };
    monthlyMap[m].purchase += inv.grand_total || 0;
  }

  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('ar-EG', { month: 'short' }),
      مبيعات: Math.round(data.sales),
      مشتريات: Math.round(data.purchase),
    }));

  return {
    salesInvoices,
    purchaseInvoices,
    totalSales,
    totalPurchase,
    paidSales,
    salesCount:       salesInvoices.length,
    purchaseCount:    purchaseInvoices.length,
    netProfit:        totalSales - totalPurchase,
    collectionRate:   totalSales > 0 ? Math.round((paidSales / totalSales) * 100) : 0,
    monthlyData,
  };
}

/** تنسيق الأرقام */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—';
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}م`;
  if (amount >= 1_000)     return `${(amount / 1_000).toFixed(1)}ك`;
  return Math.round(amount).toLocaleString('ar-EG');
}
