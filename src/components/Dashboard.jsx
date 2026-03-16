import { useEffect, useState } from 'react';
import { INSTANCES, fetchInstanceStats, formatCurrency } from '../lib/frappe';
import Logo from './Logo';
import CompanyCard from './CompanyCard';
import CompanyDetail from './CompanyDetail';
import styles from './Dashboard.module.css';

export default function Dashboard({ user, onLogout }) {
  const [stats,    setStats]    = useState({});       // { instanceId: statsObject }
  const [loading,  setLoading]  = useState({});       // { instanceId: bool }
  const [errors,   setErrors]   = useState({});       // { instanceId: errorMsg }
  const [selected, setSelected] = useState(null);     // instance object
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    // جلب كل الـ instances بشكل متوازي
    INSTANCES.forEach(inst => {
      setLoading(prev => ({ ...prev, [inst.id]: true }));
      fetchInstanceStats(inst)
        .then(data => setStats(prev => ({ ...prev, [inst.id]: data })))
        .catch(err  => setErrors(prev => ({ ...prev, [inst.id]: err.message })))
        .finally(()  => setLoading(prev => ({ ...prev, [inst.id]: false })));
    });
  }, []);

  // إجماليات كل المؤسسات
  const allStats       = Object.values(stats);
  const totalSalesAll  = allStats.reduce((s, c) => s + (c.totalSales    || 0), 0);
  const totalPurchAll  = allStats.reduce((s, c) => s + (c.totalPurchase || 0), 0);
  const totalNetProfit = totalSalesAll - totalPurchAll;
  const totalInvoices  = allStats.reduce((s, c) => s + (c.salesCount || 0) + (c.purchaseCount || 0), 0);

  const filtered = INSTANCES.filter(inst =>
    inst.name.includes(search) || inst.shortName.includes(search)
  );

  if (selected) {
    return (
      <CompanyDetail
        instance={selected}
        stats={stats[selected.id]}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Logo size={40} />
          <div>
            <p className={styles.sidebarTitle}>منصة جودة التعليم</p>
            <p className={styles.sidebarSub}>ERP Dashboard</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navItem + ' ' + styles.navActive}>
            <span>🏛️</span><span>المؤسسات</span>
          </div>
        </nav>

        {/* مؤشر الـ instances */}
        <div className={styles.instanceList}>
          {INSTANCES.map(inst => {
            const isLoading = loading[inst.id];
            const hasError  = errors[inst.id];
            const hasData   = !!stats[inst.id];
            return (
              <div
                key={inst.id}
                className={styles.instanceItem}
                onClick={() => !isLoading && hasData && setSelected(inst)}
                style={{ cursor: hasData ? 'pointer' : 'default' }}
              >
                <span className={styles.instDot} style={{
                  background: hasError ? '#ef4444' : hasData ? inst.color : '#475569',
                  boxShadow: hasData && !hasError ? `0 0 6px ${inst.color}80` : 'none',
                }} />
                <span className={styles.instName}>{inst.shortName}</span>
                {isLoading && <span className={styles.instSpinner} />}
                {hasError  && <span className={styles.instErr} title={errors[inst.id]}>!</span>}
                {hasData   && <span className={styles.instVal}>{formatCurrency(stats[inst.id]?.totalSales)}</span>}
              </div>
            );
          })}
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userBadge}>
            <span className={styles.userDot} />
            <span className={styles.userName} title={user}>{user}</span>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout} title="خروج">⏻</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>لوحة المؤسسات</h1>
            <p className={styles.pageSub}>
              السنة المالية {new Date().getFullYear()} &nbsp;·&nbsp;
              {INSTANCES.length} مؤسسات &nbsp;·&nbsp;
              {Object.keys(stats).length} محمّل
            </p>
          </div>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="ابحث..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* KPI Row */}
        <div className={styles.kpiRow}>
          <KpiCard icon="🏛️" label="المؤسسات"       value={INSTANCES.length}             color="blue" />
          <KpiCard icon="📈" label="إجمالي المبيعات" value={formatCurrency(totalSalesAll)} color="green" />
          <KpiCard icon="📦" label="إجمالي المشتريات" value={formatCurrency(totalPurchAll)} color="orange" />
          <KpiCard
            icon="💰"
            label="صافي الأرباح"
            value={formatCurrency(Math.abs(totalNetProfit))}
            sub={totalNetProfit >= 0 ? 'ربح' : 'خسارة'}
            color={totalNetProfit >= 0 ? 'green' : 'red'}
          />
          <KpiCard icon="🧾" label="إجمالي الفواتير" value={totalInvoices.toLocaleString()} color="purple" />
        </div>

        {/* Grid */}
        <div className={styles.gridHeader}>
          <h2 className={styles.gridTitle}>المؤسسات التعليمية</h2>
          <span className={styles.gridBadge}>{filtered.length} مؤسسة</span>
        </div>

        <div className={styles.grid}>
          {filtered.map((inst, i) => (
            <CompanyCard
              key={inst.id}
              instance={inst}
              stats={stats[inst.id]}
              loading={loading[inst.id]}
              error={errors[inst.id]}
              index={i}
              onClick={() => stats[inst.id] && setSelected(inst)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color }) {
  const c = {
    blue:   { bg: '#e4f5fd', text: '#0f6a96' },
    green:  { bg: '#e8f8eb', text: '#1a7a2a' },
    orange: { bg: '#fff7ed', text: '#9a3412' },
    red:    { bg: '#fef2f2', text: '#b91c1c' },
    purple: { bg: '#f5f3ff', text: '#5b21b6' },
  }[color] || { bg: '#f1f5f9', text: '#334155' };

  return (
    <div className={styles.kpi} style={{ background: c.bg }}>
      <span className={styles.kpiIcon}>{icon}</span>
      <div>
        <p className={styles.kpiLabel}>{label}</p>
        <div className={styles.kpiRow2}>
          <span className={styles.kpiVal} style={{ color: c.text }}>{value}</span>
          {sub && <span className={styles.kpiSub} style={{ color: c.text }}>{sub}</span>}
        </div>
      </div>
    </div>
  );
}
