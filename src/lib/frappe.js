import { FrappeApp } from 'frappe-js-sdk';

// قراءة الإعدادات من .env
const FRAPPE_URL = import.meta.env.VITE_FRAPPE_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const API_SECRET = import.meta.env.VITE_API_SECRET || '';

// إنشاء الـ FrappeApp instance
export const frappe = new FrappeApp(FRAPPE_URL, {
  useToken: true,
  token: () => `token ${API_KEY}:${API_SECRET}`,
  type: 'token',
});

export const db = frappe.db();
export const auth = frappe.auth();
export const call = frappe.call();

// ====================================================
// دوال مساعدة لجلب البيانات
// ====================================================

/**
 * جلب كل الشركات المسجلة في ERPNext
 */
export async function fetchCompanies() {
  return await db.getDocList('Company', {
    fields: ['name', 'company_name', 'abbr', 'country', 'default_currency', 'creation'],
    orderBy: { field: 'company_name', order: 'asc' },
    limit: 100,
  });
}

/**
 * جلب إحصائيات شركة واحدة
 */
export async function fetchCompanyStats(companyName) {
  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;

  const [salesInvoices, purchaseInvoices, customers] = await Promise.all([
    // فواتير المبيعات
    db.getDocList('Sales Invoice', {
      filters: [
        ['company', '=', companyName],
        ['docstatus', '=', 1],
        ['posting_date', '>=', startOfYear],
      ],
      fields: ['name', 'grand_total', 'outstanding_amount', 'status', 'posting_date', 'customer_name'],
      orderBy: { field: 'posting_date', order: 'desc' },
      limit: 500,
    }),
    // فواتير المشتريات
    db.getDocList('Purchase Invoice', {
      filters: [
        ['company', '=', companyName],
        ['docstatus', '=', 1],
        ['posting_date', '>=', startOfYear],
      ],
      fields: ['name', 'grand_total', 'outstanding_amount', 'status', 'posting_date', 'supplier_name'],
      orderBy: { field: 'posting_date', order: 'desc' },
      limit: 500,
    }),
    // العملاء
    db.getDocList('Customer', {
      filters: [['customer_group', '!=', '']],
      fields: ['name', 'customer_name', 'creation'],
      limit: 1000,
    }),
  ]);

  const totalSales = salesInvoices.reduce((s, i) => s + (i.grand_total || 0), 0);
  const totalPurchase = purchaseInvoices.reduce((s, i) => s + (i.grand_total || 0), 0);
  const paidSales = salesInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.grand_total || 0), 0);
  const unpaidSales = salesInvoices.filter(i => i.status === 'Unpaid').reduce((s, i) => s + (i.outstanding_amount || 0), 0);

  // تجميع المبيعات الشهرية
  const monthlyMap = {};
  salesInvoices.forEach(inv => {
    if (!inv.posting_date) return;
    const month = inv.posting_date.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { sales: 0, purchase: 0 };
    monthlyMap[month].sales += inv.grand_total || 0;
  });
  purchaseInvoices.forEach(inv => {
    if (!inv.posting_date) return;
    const month = inv.posting_date.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { sales: 0, purchase: 0 };
    monthlyMap[month].purchase += inv.grand_total || 0;
  });

  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('ar-EG', { month: 'short', year: '2-digit' }),
      مبيعات: Math.round(data.sales),
      مشتريات: Math.round(data.purchase),
    }));

  return {
    salesInvoices,
    purchaseInvoices,
    customers,
    totalSales,
    totalPurchase,
    paidSales,
    unpaidSales,
    salesCount: salesInvoices.length,
    purchaseCount: purchaseInvoices.length,
    customersCount: customers.length,
    monthlyData,
    netProfit: totalSales - totalPurchase,
    collectionRate: totalSales > 0 ? Math.round((paidSales / totalSales) * 100) : 0,
  };
}

/**
 * تنسيق الأرقام
 */
export function formatCurrency(amount, currency = '') {
  if (!amount) return '0';
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}م`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}ك`;
  return Math.round(amount).toLocaleString('ar-EG');
}
