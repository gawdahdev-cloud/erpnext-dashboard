import { useState, useEffect } from 'react';
import Logo from './Logo';
import styles from './Settings.module.css';

export default function Settings({ onSave }) {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('erp_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setUrl(config.url || '');
        setApiKey(config.apiKey || '');
        setApiSecret(config.apiSecret || '');
      } catch {}
    }
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!url || !apiKey || !apiSecret) {
      setError('يرجى ملء جميع الحقول');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const cleanUrl = url.replace(/\/$/, '');
      const config = { url: cleanUrl, apiKey, apiSecret };

      // ⚠️ تنبيه: في الـ dev mode لازم تحط الـ URL في vite.config.js
      // في الـ production هنستخدم الـ URL مباشرة
      localStorage.setItem('erp_config', JSON.stringify(config));
      onSave(config);
    } catch (err) {
      setError('حدث خطأ. تحقق من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgDecor}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <Logo size={64} />
          <div>
            <h1 className={styles.title}>منصة جودة التعليم</h1>
            <p className={styles.subtitle}>لوحة إدارة المؤسسات التعليمية</p>
          </div>
        </div>

        <div className={styles.divider}></div>

        <h2 className={styles.formTitle}>إعداد الاتصال بـ ERPNext</h2>
        <p className={styles.formDesc}>
          أدخل بيانات الـ API Key للاتصال بنظام الـ ERP
        </p>

        <form onSubmit={handleConnect} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>رابط الـ ERPNext</label>
            <input
              className={styles.input}
              placeholder="https://your-erp.frappe.cloud"
              value={url}
              onChange={e => setUrl(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>API Key</label>
            <input
              className={styles.input}
              placeholder="xxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>API Secret</label>
            <input
              type="password"
              className={styles.input}
              placeholder="xxxxxxxxxxxxxxxx"
              value={apiSecret}
              onChange={e => setApiSecret(e.target.value)}
              dir="ltr"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner}></span>
            ) : (
              <>
                <span>اتصال بالنظام</span>
                <span className={styles.arrow}>←</span>
              </>
            )}
          </button>
        </form>

        {/* Dev mode notice */}
        <div className={styles.devNotice}>
          <p className={styles.devNoticeTitle}>⚙️ تشغيل محلي (Dev Mode)</p>
          <p className={styles.devNoticeText}>
            افتح <code>vite.config.js</code> وحط رابطك في:
          </p>
          <code className={styles.devCode}>
            {`const ERP_URL = '${url || 'https://your-erp.frappe.cloud'}'`}
          </code>
          <p className={styles.devNoticeText}>
            ده بيحل مشكلة CORS تلقائياً بدون أي إعدادات على السيرفر ✅
          </p>
        </div>

        <div className={styles.helpBox}>
          <p className={styles.helpTitle}>كيف تحصل على API Key؟</p>
          <ol className={styles.helpList}>
            <li>افتح ERPNext → Settings → My Profile</li>
            <li>اذهب إلى قسم "API Access"</li>
            <li>اضغط "Generate Keys"</li>
            <li>انسخ الـ API Key والـ API Secret</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
