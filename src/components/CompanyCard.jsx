import { formatCurrency } from '../lib/frappe';
import styles from './CompanyCard.module.css';

export default function CompanyCard({ instance, stats, loading, error, index, onClick }) {
  const s = stats || {};
  const initials = instance.shortName.slice(0, 2);

  return (
    <div
      className={styles.card + (error ? ' ' + styles.hasError : '')}
      onClick={onClick}
      style={{ '--accent': instance.color, animationDelay: `${index * 50}ms` }}
    >
      {/* Top */}
      <div className={styles.top}>
        <div className={styles.avatar} style={{ background: instance.color + '18', color: instance.color }}>
          {initials}
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{instance.name}</h3>
          <p className={styles.meta}>{instance.shortName} · {instance.url?.replace('https://', '')}</p>
        </div>
        <div className={styles.statusDot} style={{
          background: error ? '#ef4444' : stats ? instance.color : '#94a3b8',
          boxShadow: stats && !error ? `0 0 6px ${instance.color}80` : 'none',
        }} />
      </div>

      {/* Accent line */}
      <div className={styles.line} style={{ background: `linear-gradient(90deg, ${instance.color}, transparent)` }} />

      {/* Content */}
      {loading && (
        <div className={styles.skeletons}>
          <div className={styles.skel} />
          <div className={styles.skel} style={{ width: '65%' }} />
        </div>
      )}

      {error && !loading && (
        <div className={styles.errBox}>
          <span>⚠️</span>
          <span>تعذّر الاتصال بالـ instance</span>
        </div>
      )}

      {stats && !loading && !error && (
        <>
          <div className={styles.statsRow}>
            <Stat icon="📈" label="المبيعات"  value={formatCurrency(s.totalSales)}    sub={`${s.salesCount} ف`}    color={instance.color} />
            <div className={styles.vline} />
            <Stat icon="📦" label="المشتريات" value={formatCurrency(s.totalPurchase)} sub={`${s.purchaseCount} ف`} color="#27ADE1" />
            <div className={styles.vline} />
            <Stat
              icon="💰"
              label="الصافي"
              value={formatCurrency(Math.abs(s.netProfit || 0))}
              sub={(s.netProfit || 0) >= 0 ? '✅' : '⚠️'}
              color={(s.netProfit || 0) >= 0 ? '#36B54A' : '#ef4444'}
            />
          </div>

          {/* Collection bar */}
          <div className={styles.barWrap}>
            <div className={styles.barTop}>
              <span className={styles.barLabel}>نسبة التحصيل</span>
              <span className={styles.barPct} style={{ color: instance.color }}>{s.collectionRate}%</span>
            </div>
            <div className={styles.barBg}>
              <div
                className={styles.barFill}
                style={{ width: `${s.collectionRate}%`, background: instance.color }}
              />
            </div>
          </div>
        </>
      )}

      {/* CTA */}
      {stats && !error && (
        <div className={styles.cta} style={{ color: instance.color }}>
          <span>عرض التفاصيل</span>
          <span className={styles.ctaArrow}>←</span>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, sub, color }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statVal} style={{ color }}>{value}</span>
      <span className={styles.statSub}>{sub}</span>
    </div>
  );
}
