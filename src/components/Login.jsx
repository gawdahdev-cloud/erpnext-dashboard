
import React, { useState } from 'react';
import Logo from './Logo';
import { login, CENTRE_INSTANCE, INSTANCES } from '../lib/frappe';
import styles from './Login.module.css';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // ✨ بدء عملية تسجيل الدخول عبر OAuth
      // سيتم إعادة توجيه المستخدم، لذلك لن يصل الكود إلى ما بعد هذا السطر
      login();
    } catch (err) {
      console.error(err);
      setError('فشل بدء عملية تسجيل الدخول. تأكد من صحة إعدادات OAUTH_CLIENT_ID.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoRing}>
            <Logo size={52} />
          </div>
          <h1 className={styles.title}>منصة جودة التعليم</h1>
          <p className={styles.subtitle}>نظام إدارة المؤسسات التعليمية</p>
        </div>

        {/* Instance badge */}
        <div className={styles.instanceBadge}>
          <span className={styles.instanceDot} />
          <span>تسجيل الدخول عبر: <strong>{CENTRE_INSTANCE?.name || 'المركز'}</strong></span>
          <span className={styles.instanceUrl}>{CENTRE_INSTANCE?.url?.replace('https://', '')}</span>
        </div>

        {/* Login Button */}
        <div className={styles.form}>
          {error && (
            <div className={styles.error}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button onClick={handleLogin} className={styles.btn} disabled={loading}>
            {loading
              ? <><span className={styles.spinner} /> جاري التوجيه...</>
              : <><span>تسجيل الدخول الآمن</span><span className={styles.arrow}>→</span></>
            }
          </button>
          <p className={styles.infoText}>
            سيتم توجيهك إلى صفحة تسجيل الدخول الرسمية الخاصة بالمركز لإتمام العملية بأمان.
          </p>
        </div>

        {/* Instances preview */}
        <div className={styles.footer}>
          <p className={styles.footerLabel}>صلاحية الوصول لـ {INSTANCES.length} مؤسسات</p>
          <div className={styles.dots}>
            {INSTANCES.map(inst => (
              <div
                key={inst.id}
                className={styles.dot}
                style={{ background: inst.color }}
                title={inst.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
