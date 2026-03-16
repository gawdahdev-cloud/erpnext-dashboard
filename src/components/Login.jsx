import { useState } from 'react';
import Logo from './Logo';
import { loginWithCentre, CENTRE_INSTANCE } from '../lib/frappe';
import styles from './Login.module.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('أدخل اسم المستخدم وكلمة المرور'); return; }
    setLoading(true);
    setError('');
    try {
      const user = await loginWithCentre(username, password);
      onLogin(user || username);
    } catch (err) {
      setError('بيانات الدخول غلط أو تحقق من الاتصال بالمركز');
    } finally {
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
          <span>تسجيل الدخول عبر: <strong>المركز</strong></span>
          <span className={styles.instanceUrl}>{CENTRE_INSTANCE?.url?.replace('https://', '')}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>اسم المستخدم أو البريد الإلكتروني</label>
            <input
              className={styles.input}
              placeholder="admin@svu.edu.eg"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              dir="ltr"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>كلمة المرور</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.error}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading
              ? <><span className={styles.spinner} /> جاري التحقق...</>
              : <><span>دخول</span><span className={styles.arrow}>←</span></>
            }
          </button>
        </form>

        {/* Instances preview */}
        <div className={styles.footer}>
          <p className={styles.footerLabel}>صلاحية الوصول لـ 8 مؤسسات</p>
          <div className={styles.dots}>
            {(typeof __INSTANCES__ !== 'undefined' ? __INSTANCES__ : []).map(inst => (
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
