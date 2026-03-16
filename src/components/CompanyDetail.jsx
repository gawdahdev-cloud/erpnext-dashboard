import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';
import { formatCurrency } from '../lib/frappe';
import styles from './CompanyDetail.module.css';

const STATUS_MAP = {
  Paid: { label: 'مدفوع', color: '#36B54A', bg: '#e8f8eb' },
  Unpaid: { label: 'غير مدفوع', color: '#ef4444', bg: '#fef2f2' },
  Overdue: { label: 'متأخر', color: '#f97316', bg: '#fff7ed' },
  'Return': { label: 'مرتجع', color: '#8b5cf6', bg: '#f5f3ff' },
  'Credit Note Issued': { label: 'إشعار دائن', color: '#6b7280', bg: '#f3f4f6' },
  'Partly Paid': { label: 'مدفوع جزئياً', color: '#27ADE1', bg: '#e4f5fd' },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8 }}>
      {s.label}
    </span>
  );
}

export default function CompanyDetail({ company, stats, onBack }) {
  const s = stats || {};
  const currency = company.default_currency || '';

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <span className={styles.backArrow}>→</span>
          <span>رجوع</span>
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{company.company_name}</h1>
          <div className={styles.headerMeta}>
            <span className={styles.abbr}>{company.abbr}</span>
            {company.country && <span>🌍 {company.country}</span>}
            <span>{currency}</span>
            <span>السنة المالية {new Date().getFullYear()}</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* KPIs */}
        <div className={styles.kpiGrid}>
          {[
            { label: 'إجمالي المبيعات', value: formatCurrency(s.totalSales), sub: `${s.salesCount || 0} فاتورة`, icon: '📈', color: '#36B54A', bg: '#e8f8eb' },
            { label: 'إجمالي المشتريات', value: formatCurrency(s.totalPurchase), sub: `${s.purchaseCount || 0} فاتورة`, icon: '📦', color: '#27ADE1', bg: '#e4f5fd' },
            { label: 'صافي الأرباح', value: formatCurrency(Math.abs(s.netProfit || 0)), sub: (s.netProfit || 0) >= 0 ? '✅ ربح' : '⚠️ خسارة', icon: '💰', color: (s.netProfit || 0) >= 0 ? '#36B54A' : '#ef4444', bg: (s.netProfit || 0) >= 0 ? '#e8f8eb' : '#fef2f2' },
            { label: 'نسبة التحصيل', value: `${s.collectionRate || 0}%`, sub: `${formatCurrency(s.paidSales)} محصّل`, icon: '🎯', color: '#7c3aed', bg: '#f5f3ff' },
          ].map((k, i) => (
            <div key={i} className={styles.kpiCard} style={{ '--kc': k.color, '--kb': k.bg }}>
              <div className={styles.kpiIcon}>{k.icon}</div>
              <div>
                <p className={styles.kpiLabel}>{k.label}</p>
                <p className={styles.kpiValue}>{k.value}</p>
                <p className={styles.kpiSub}>{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className={styles.chartsRow}>
          {/* Monthly Area Chart */}
          {s.monthlyData && s.monthlyData.length > 0 && (
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>📊 المبيعات والمشتريات الشهرية</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={s.monthlyData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#36B54A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#36B54A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPurchase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#27ADE1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#27ADE1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} width={50} />
                  <Tooltip formatter={(v, name) => [v.toLocaleString() + ' ' + currency, name]} contentStyle={{ fontFamily: 'Cairo', fontSize: 12, borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Cairo' }} />
                  <Area type="monotone" dataKey="مبيعات" stroke="#36B54A" strokeWidth={2.5} fill="url(#gSales)" dot={false} />
                  <Area type="monotone" dataKey="مشتريات" stroke="#27ADE1" strokeWidth={2.5} fill="url(#gPurchase)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bar comparison */}
          {s.monthlyData && s.monthlyData.length > 0 && (
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>📉 مقارنة شهرية</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={s.monthlyData.slice(-6)} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} width={50} />
                  <Tooltip formatter={(v, name) => [v.toLocaleString() + ' ' + currency, name]} contentStyle={{ fontFamily: 'Cairo', fontSize: 12, borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Cairo' }} />
                  <Bar dataKey="مبيعات" fill="#36B54A" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="مشتريات" fill="#27ADE1" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Invoices Tables */}
        <div className={styles.tablesRow}>
          {/* Sales Invoices */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>📋 فواتير المبيعات</h2>
              <span className={styles.tableBadge} style={{ background: '#e8f8eb', color: '#1a7a2a' }}>{s.salesCount || 0}</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>رقم الفاتورة</th>
                    <th>العميل</th>
                    <th>التاريخ</th>
                    <th>الإجمالي</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {(s.salesInvoices || []).slice(0, 12).map(inv => (
                    <tr key={inv.name}>
                      <td className={styles.invoiceId}>{inv.name}</td>
                      <td className={styles.customerName}>{inv.customer_name || '—'}</td>
                      <td className={styles.date}>{inv.posting_date}</td>
                      <td className={styles.amount}>{(inv.grand_total || 0).toLocaleString()} {currency}</td>
                      <td><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                  {(!s.salesInvoices || s.salesInvoices.length === 0) && (
                    <tr><td colSpan={5} className={styles.emptyRow}>لا توجد فواتير</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Purchase Invoices */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>📦 فواتير المشتريات</h2>
              <span className={styles.tableBadge} style={{ background: '#e4f5fd', color: '#0f6a96' }}>{s.purchaseCount || 0}</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>رقم الفاتورة</th>
                    <th>المورد</th>
                    <th>التاريخ</th>
                    <th>الإجمالي</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {(s.purchaseInvoices || []).slice(0, 12).map(inv => (
                    <tr key={inv.name}>
                      <td className={styles.invoiceId}>{inv.name}</td>
                      <td className={styles.customerName}>{inv.supplier_name || '—'}</td>
                      <td className={styles.date}>{inv.posting_date}</td>
                      <td className={styles.amount}>{(inv.grand_total || 0).toLocaleString()} {currency}</td>
                      <td><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                  {(!s.purchaseInvoices || s.purchaseInvoices.length === 0) && (
                    <tr><td colSpan={5} className={styles.emptyRow}>لا توجد فواتير</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
