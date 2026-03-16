
import { FrappeApp } from 'frappe-js-sdk';

// ================================================================
//  ⬇️ البيانات التالية يتم تمريرها من vite.config.js
// ================================================================
export const INSTANCES = typeof __INSTANCES__ !== 'undefined' ? __INSTANCES__ : [];
export const OAUTH_CLIENT_ID = typeof __OAUTH_CLIENT_ID__ !== 'undefined' ? __OAUTH_CLIENT_ID__ : '';

// instance المركز دايمًا أول واحد في القائمة
export const CENTRE_INSTANCE = INSTANCES.find(i => i.id === 'centre') || INSTANCES[0];

// ================================================================
// 🚀 إعداد Frappe App مركزي باستخدام OAuth 2.0
// ================================================================

let frappe;

/**
 * تهيئة الـ Frappe App المركزي. يجب استدعاؤها مرة واحدة عند بدء تشغيل التطبيق.
 */
export function initFrappe() {
  if (!CENTRE_INSTANCE) {
    console.error("لم يتم العثور على instance المركز");
    return;
  }
  frappe = new FrappeApp(CENTRE_INSTANCE.url, {
    useToken: true,
    // لا نمرر أي token هنا، الـ SDK سيتولى عملية OAuth
  });
  return frappe;
}

/**
 * يبدأ عملية تسجيل الدخول عبر OAuth.
 * سيقوم بإعادة توجيه المستخدم إلى صفحة تسجيل الدخول في Frappe.
 */
export function login() {
  if (!frappe) throw new Error("Frappe App لم يتم تهيئتها");
  if (!OAUTH_CLIENT_ID || OAUTH_CLIENT_ID.includes('الرجاء إدخال')) {
    throw new Error("OAUTH_CLIENT_ID غير صحيح في vite.config.js");
  }

  const redirectParams = new URLSearchParams({
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: window.location.origin,
    response_type: 'code',
    scope: 'all',
  });

  const authorizationUrl = `${CENTRE_INSTANCE.url}/api/method/frappe.integrations.oauth2.authorize?${redirectParams}`;
  window.location.href = authorizationUrl;
}

/**
 * معالجة إعادة التوجيه بعد تسجيل الدخول.
 * يجب استدعاؤها في الصفحة الرئيسية للتحقق مما إذا كان المستخدم عائداً من Frappe.
 * @returns {Promise<boolean>} - `true` إذا تمت معالجة تسجيل الدخول بنجاح
 */
export async function handleLoginRedirect() {
  if (!frappe) throw new Error("Frappe App لم يتم تهيئتها");
  // سيقوم الـ SDK تلقائياً بالتحقق من وجود authorization_code في الـ URL
  // وتبادله بـ access_token إذا وجد.
  const loggedIn = await frappe.auth().isLoggedIn();
  return loggedIn;
}

/**
 * تسجيل الخروج.
 */
export async function logout() {
  if (!frappe) throw new Error("Frappe App لم يتم تهيئتها");
  await frappe.auth().logout();
  window.location.href = window.location.origin; // إعادة توجيه للصفحة الرئيسية
}

/**
 * الحصول على كائن Frappe App المهيأ.
 */
export function getFrappe() {
  if (!frappe) throw new Error("Frappe App لم يتم تهيئتها");
  return frappe;
}

/**
 * جلب إحصائيات instance واحد.
 * يستخدم الآن الـ token الآمن الذي تم الحصول عليه عبر OAuth.
 */
export async function fetchInstanceStats(instance) {
  const mainFrappe = getFrappe();
  const loggedIn = await mainFrappe.auth().isLoggedIn();
  if (!loggedIn) throw new Error("المستخدم غير مسجل دخوله");

  // إنشاء FrappeApp مؤقت للـ instance المطلوب
  const instanceFrappe = new FrappeApp(instance.proxyBase, {
    useToken: true,
    // نستخدم نفس الـ token الذي حصلنا عليه من تسجيل الدخول المركزي
    token: () => mainFrappe.auth().getToken(),
    type: 'Bearer', // OAuth يستخدم Bearer tokens
  });

  const db = instanceFrappe.db();
  const year = new Date().getFullYear();
  const startOfYear = `${year}-01-01`;

  const [salesInvoices, purchaseInvoices] = await Promise.all([
    db.getDocList('Sales Invoice', {
      filters: [ ['docstatus', '=', 1], ['posting_date', '>=', startOfYear], ],
      fields: ['name', 'grand_total', 'outstanding_amount', 'status', 'posting_date', 'customer_name'],
      orderBy: { field: 'posting_date', order: 'desc' },
      limit: 500,
    }),
    db.getDocList('Purchase Invoice', {
      filters: [ ['docstatus', '=', 1], ['posting_date', '>=', startOfYear], ],
      fields: ['name', 'grand_total', 'outstanding_amount', 'status', 'posting_date', 'supplier_name'],
      orderBy: { field: 'posting_date', order: 'desc' },
      limit: 500,
    }),
  ]);

  const totalSales = salesInvoices.reduce((s, i) => s + (i.grand_total || 0), 0);
  const totalPurchase = purchaseInvoices.reduce((s, i) => s + (i.grand_total || 0), 0);
  const paidSales = salesInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.grand_total || 0), 0);

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
      'مبيعات': Math.round(data.sales),
      'مشتريات': Math.round(data.purchase),
    }));

  return {
    salesInvoices,
    purchaseInvoices,
    totalSales,
    totalPurchase,
    paidSales,
    salesCount: salesInvoices.length,
    purchaseCount: purchaseInvoices.length,
    netProfit: totalSales - totalPurchase,
    collectionRate: totalSales > 0 ? Math.round((paidSales / totalSales) * 100) : 0,
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
