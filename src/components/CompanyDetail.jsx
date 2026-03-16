import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { formatCurrency } from '../lib/frappe';
import styles from './CompanyDetail.module.css';

const STATUS = {
  Paid:              { label: 'مدفوع',        color: '#36B54A', bg: '#e8f8eb' },
  Unpaid:            { label: 'غير مدفوع',    color: '#ef4444', bg: '#fef2f2' },
  Overdue:           { label: 'متأخر',         color: '#f97316', bg: '#fff7ed' },
  'Partly Paid':     { label: 'مدفوع جزئياً', color: '#27ADE1', bg: '#e4f5fd' },
  Return:            { label: 'مرتجع',         color: '#8b5cf6', bg: '#f5f3ff' },
};

function Badge({ status }) {
  const s = STATUS[status] || { label: status, color: '#64748b', bg: '#f1f5f9' };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8 }}>
      {s.label}
    </span>
  );
}

export default function CompanyDetail({ instance, stats, onBack }) {
  const s = stats || {};
  const accent = instance.color;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <span>→</span> رجوع
        </button>
        <div>
          <h1 className={styles.title}>{instance.name}</h1>
          <p className={styles.meta}>
            <span style={{ background: accent + '18', color: accent }} className={styles.badge}>{instance.shortName}</span>
            {instance.url?.replace('https://', '')} · السنة المالية {new Date().getFullYear()}
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {/* KPIs */}
        <div className={styles.kpis}>
          {[
            { label: 'إجمالي المبيعات',  value: formatCurrency(s.totalSales),   sub: `${s.salesCount||0} فاتورة`,   color: '#36B54A', bg: '#e8f8eb' },
            { label: 'إجمالي المشتريات', value: formatCurrency(s.totalPurchase), sub: `${s.purchaseCount||0} فاتورة`, color: '#27ADE1', bg: '#e4f5fd' },
            { label: 'صافي الأرباح',     value: formatCurrency(Math.abs(s.netProfit||0)), sub: (s.netProfit||0)>=0?'✅ ربح':'⚠️ خسارة', color: (s.netProfit||0)>=0?'#36B54A':'#ef4444', bg: (s.netProfit||0)>=0?'#e8f8eb':'#fef2f2' },
            { label: 'نسبة التحصيل',     value: `${s.collectionRate||0}%`,      sub: `${formatCurrency(s.paidSales)} محصّل`,  color: '#7c3aed', bg: '#f5f3ff' },
          ].map((k, i) => (
            <div key={i} className={styles.kpi} style={{ background: k.bg }}>
              <p className={styles.kpiLabel}>{k.label}</p>
              <p className={styles.kpiVal}  style={{ color: k.color }}>{k.value}</p>
              <p className={styles.kpiSub}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {s.monthlyData?.length > 0 && (
          <div className={styles.charts}>
            <div className={styles.chart}>
              <h2 className={styles.chartTitle}>📈 المبيعات والمشتريات الشهرية</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={s.monthlyData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={accent} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#27ADE1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#27ADE1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} width={46} />
                  <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} contentStyle={{ fontFamily: 'Cairo', fontSize: 12, borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Cairo' }} />
                  <Area type="monotone" dataKey="مبيعات"   stroke={accent}    strokeWidth={2.5} fill="url(#gs)" dot={false} />
                  <Area type="monotone" dataKey="مشتريات"  stroke="#27ADE1"   strokeWidth={2.5} fill="url(#gp)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chart}>
              <h2 className={styles.chartTitle}>📊 مقارنة آخر 6 أشهر</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={s.monthlyData.slice(-6)} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} width={46} />
                  <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} contentStyle={{ fontFamily: 'Cairo', fontSize: 12, borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Cairo' }} />
                  <Bar dataKey="مبيعات"  fill={accent}  radius={[5,5,0,0]} maxBarSize={28} />
                  <Bar dataKey="مشتريات" fill="#27ADE1" radius={[5,5,0,0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tables */}
        <div className={styles.tables}>
          <InvoiceTable
            title="📋 فواتير المبيعات"
            count={s.salesCount}
            rows={s.salesInvoices}
            nameKey="customer_name"
            nameLabel="العميل"
            color={accent}
          />
          <InvoiceTable
            title="📦 فواتير المشتريات"
            count={s.purchaseCount}
            rows={s.purchaseInvoices}
            nameKey="supplier_name"
            nameLabel="المورد"
            color="#27ADE1"
          />
        </div>
      </main>
    </div>
  );
}

function InvoiceTable({ title, count, rows = [], nameKey, nameLabel, color }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHead}>
        <h2 className={styles.tableTitle}>{title}</h2>
        <span className={styles.tableBadge} style={{ background: color + '18', color }}>{count || 0}</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>رقم الفاتورة</th>
              <th>{nameLabel}</th>
              <th>التاريخ</th>
              <th>الإجمالي</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 12).map(inv => (
              <tr key={inv.name}>
                <td className={styles.invId}>{inv.name}</td>
                <td className={styles.invName}>{inv[nameKey] || '—'}</td>
                <td className={styles.invDate}>{inv.posting_date}</td>
                <td className={styles.invAmt}>{(inv.grand_total||0).toLocaleString()}</td>
                <td><Badge status={inv.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className={styles.empty}>لا توجد فواتير</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
