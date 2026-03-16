import { formatCurrency } from '../lib/frappe';
import styles from './CompanyCard.module.css';

// ألوان تلقائية لكل شركة
const CARD_COLORS = [
  { accent: '#36B54A', bg: '#e8f8eb', text: '#1a7a2a' },
  { accent: '#27ADE1', bg: '#e4f5fd', text: '#0f6a96' },
  { accent: '#7c3aed', bg: '#f3f0ff', text: '#5b21b6' },
  { accent: '#ea580c', bg: '#fff7ed', text: '#9a3412' },
  { accent: '#0891b2', bg: '#ecfeff', text: '#0e7490' },
  { accent: '#be185d', bg: '#fdf2f8', text: '#9d174d' },
];

export default function CompanyCard({ company, stats, loading, index, onClick }) {
  const s = stats || {};
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const initials = (company.abbr || company.company_name).slice(0, 2).toUpperCase();

  return (
    <div
      className={styles.card}
      onClick={onClick}
      style={{
        '--card-accent': color.accent,
        '--card-bg': color.bg,
        '--card-text': color.text,
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Top section */}
      <div className={styles.top}>
        <div className={styles.avatar} style={{ background: color.bg, color: color.text }}>
          {initials}
        </div>
        <div className={styles.companyInfo}>
          <h3 className={styles.name}>{company.company_name}</h3>
          <div className={styles.meta}>
            <span className={styles.badge}>{company.abbr}</span>
            {company.country && <span className={styles.country}>🌍 {company.country}</span>}
          </div>
        </div>
        <div className={styles.currency}>{company.default_currency}</div>
      </div>

      {/* Accent bar */}
      <div className={styles.accentBar} style={{ background: `linear-gradient(90deg, ${color.accent}, transparent)` }}></div>

      {/* Stats */}
      {loading ? (
        <div className={styles.skeletonWrap}>
          <div className={styles.skeleton}></div>
          <div className={styles.skeleton} style={{ width: '70%' }}></div>
        </div>
      ) : (
        <>
          <div className={styles.statsRow}>
            <StatBlock
              label="المبيعات"
              value={formatCurrency(s.totalSales)}
              sub={`${s.salesCount || 0} فاتورة`}
              icon="📈"
              color="green"
            />
            <div className={styles.divider}></div>
            <StatBlock
              label="المشتريات"
              value={formatCurrency(s.totalPurchase)}
              sub={`${s.purchaseCount || 0} فاتورة`}
              icon="📦"
              color="blue"
            />
            <div className={styles.divider}></div>
            <StatBlock
              label="الصافي"
              value={formatCurrency(Math.abs(s.netProfit || 0))}
              sub={(s.netProfit || 0) >= 0 ? '✅ ربح' : '⚠️ خسارة'}
              icon="💰"
              color={(s.netProfit || 0) >= 0 ? 'green' : 'red'}
            />
          </div>

          {/* Collection rate bar */}
          {s.collectionRate !== undefined && (
            <div className={styles.collectionWrap}>
              <div className={styles.collectionHeader}>
                <span className={styles.collectionLabel}>نسبة التحصيل</span>
                <span className={styles.collectionPct} style={{ color: color.accent }}>{s.collectionRate}%</span>
              </div>
              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{ width: `${s.collectionRate}%`, background: color.accent }}
                ></div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CTA */}
      <div className={styles.cta} style={{ color: color.accent }}>
        <span>عرض التفاصيل</span>
        <span className={styles.ctaArrow}>←</span>
      </div>
    </div>
  );
}

function StatBlock({ label, value, sub, icon, color }) {
  const textColor = color === 'green' ? 'var(--green-dark)' : color === 'blue' ? 'var(--blue-dark)' : '#b91c1c';
  return (
    <div className={styles.statBlock}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue} style={{ color: textColor }}>{value}</span>
      <span className={styles.statSub}>{sub}</span>
    </div>
  );
}
