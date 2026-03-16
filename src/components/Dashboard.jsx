import { useEffect, useState, useCallback } from 'react';
import { FrappeApp } from 'frappe-js-sdk';
import { createFrappe, formatCurrency } from '../lib/frappe';
import Logo from './Logo';
import CompanyCard from './CompanyCard';
import CompanyDetail from './CompanyDetail';
import styles from './Dashboard.module.css';

export default function Dashboard({ config, onDisconnect }) {
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState({});
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // إنشاء الـ frappe instance من الـ config
  const getFrappe = useCallback(() => {
    return createFrappe(config);
  }, [config]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const frappe = getFrappe();
      const db = frappe.db();
      const list = await db.getDocList('Company', {
        fields: ['name', 'company_name', 'abbr', 'country', 'default_currency'],
        orderBy: { field: 'company_name', order: 'asc' },
        limit: 100,
      });
      setCompanies(list);
      // جلب إحصائيات كل شركة بشكل متوازي
      loadAllStats(list, db);
    } catch (err) {
      setError('فشل الاتصال بالـ ERPNext. تحقق من الإعدادات وتفعيل CORS.');
    } finally {
      setLoading(false);
    }
  };

  const loadAllStats = async (companiesList, db) => {
    const currentYear = new Date().getFullYear();
    const startOfYear = `${currentYear}-01-01`;

    await Promise.all(
      companiesList.map(async (company) => {
        setLoadingStats(prev => ({ ...prev, [company.name]: true }));
        try {
          const [salesInvoices, purchaseInvoices] = await Promise.all([
            db.getDocList('Sales Invoice', {
              filters: [['company', '=', company.name], ['docstatus', '=', 1], ['posting_date', '>=', startOfYear]],
              fields: ['name', 'grand_total', 'outstanding_amount', 'status', 'posting_date', 'customer_name'],
              orderBy: { field: 'posting_date', order: 'desc' },
              limit: 500,
            }),
            db.getDocList('Purchase Invoice', {
              filters: [['company', '=', company.name], ['docstatus', '=', 1], ['posting_date', '>=', startOfYear]],
              fields: ['name', 'grand_total', 'outstanding_amount', 'status', 'posting_date', 'supplier_name'],
              orderBy: { field: 'posting_date', order: 'desc' },
              limit: 500,
            }),
          ]);

          const totalSales = salesInvoices.reduce((s, i) => s + (i.grand_total || 0), 0);
          const totalPurchase = purchaseInvoices.reduce((s, i) => s + (i.grand_total || 0), 0);
          const paidSales = salesInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.grand_total || 0), 0);

          // تجميع شهري
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
              month: new Date(month + '-01').toLocaleDateString('ar-EG', { month: 'short' }),
              مبيعات: Math.round(data.sales),
              مشتريات: Math.round(data.purchase),
            }));

          setStats(prev => ({
            ...prev,
            [company.name]: {
              salesInvoices,
              purchaseInvoices,
              totalSales,
              totalPurchase,
              paidSales,
              salesCount: salesInvoices.length,
              purchaseCount: purchaseInvoices.length,
              monthlyData,
              netProfit: totalSales - totalPurchase,
              collectionRate: totalSales > 0 ? Math.round((paidSales / totalSales) * 100) : 0,
            }
          }));
        } catch (e) {
          // تجاهل أخطاء شركة واحدة
        } finally {
          setLoadingStats(prev => ({ ...prev, [company.name]: false }));
        }
      })
    );
  };

  // إجمالي كل الشركات
  const totalSalesAll = Object.values(stats).reduce((s, c) => s + (c.totalSales || 0), 0);
  const totalPurchaseAll = Object.values(stats).reduce((s, c) => s + (c.totalPurchase || 0), 0);
  const totalNetProfit = totalSalesAll - totalPurchaseAll;

  const filteredCompanies = companies.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.abbr || '').toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <CompanyDetail
        company={selected}
        stats={stats[selected.name]}
        currency={selected.default_currency}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoWrap}>
            <Logo size={44} />
          </div>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleMain}>منصة جودة التعليم</span>
            <span className={styles.sidebarTitleSub}>ERP Dashboard</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navItem + ' ' + styles.navActive}>
            <span className={styles.navIcon}>🏛️</span>
            <span>المؤسسات</span>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.connectedBadge}>
            <span className={styles.dot}></span>
            <span>متصل</span>
          </div>
          <button className={styles.disconnectBtn} onClick={onDisconnect} title="قطع الاتصال">
            ⏻
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>لوحة المؤسسات</h1>
            <p className={styles.pageSubtitle}>السنة المالية {new Date().getFullYear()} · {companies.length} مؤسسة</p>
          </div>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="ابحث عن مؤسسة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </header>

        {error && (
          <div className={styles.errorBanner}>
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={loadCompanies} className={styles.retryBtn}>إعادة المحاولة</button>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.loadingSpinner}></div>
            <p>جاري تحميل البيانات من ERPNext...</p>
          </div>
        ) : (
          <>
            {/* KPI Summary */}
            <div className={styles.kpiRow}>
              <KpiCard
                icon="🏛️"
                label="إجمالي المؤسسات"
                value={companies.length}
                color="blue"
              />
              <KpiCard
                icon="📈"
                label="إجمالي المبيعات"
                value={formatCurrency(totalSalesAll)}
                color="green"
              />
              <KpiCard
                icon="📦"
                label="إجمالي المشتريات"
                value={formatCurrency(totalPurchaseAll)}
                color="orange"
              />
              <KpiCard
                icon="💰"
                label="صافي الأرباح"
                value={formatCurrency(Math.abs(totalNetProfit))}
                sub={totalNetProfit >= 0 ? 'ربح' : 'خسارة'}
                color={totalNetProfit >= 0 ? 'green' : 'red'}
              />
            </div>

            {/* Companies Grid */}
            <div className={styles.gridHeader}>
              <h2 className={styles.gridTitle}>المؤسسات التعليمية</h2>
              <span className={styles.gridCount}>{filteredCompanies.length} مؤسسة</span>
            </div>

            <div className={styles.grid}>
              {filteredCompanies.map((company, i) => (
                <CompanyCard
                  key={company.name}
                  company={company}
                  stats={stats[company.name]}
                  loading={loadingStats[company.name]}
                  index={i}
                  onClick={() => setSelected(company)}
                />
              ))}
              {filteredCompanies.length === 0 && (
                <div className={styles.noResults}>
                  <span>🔍</span>
                  <p>لا توجد نتائج للبحث</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color }) {
  const colorMap = {
    blue: { bg: 'var(--blue-light)', accent: 'var(--blue)', text: 'var(--blue-dark)' },
    green: { bg: 'var(--green-light)', accent: 'var(--green)', text: 'var(--green-dark)' },
    orange: { bg: '#fff7ed', accent: '#f97316', text: '#c2410c' },
    red: { bg: '#fef2f2', accent: '#ef4444', text: '#b91c1c' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={styles.kpiCard} style={{ '--kpi-bg': c.bg, '--kpi-accent': c.accent, '--kpi-text': c.text }}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div className={styles.kpiContent}>
        <p className={styles.kpiLabel}>{label}</p>
        <div className={styles.kpiValueRow}>
          <span className={styles.kpiValue}>{value}</span>
          {sub && <span className={styles.kpiSub}>{sub}</span>}
        </div>
      </div>
    </div>
  );
}
