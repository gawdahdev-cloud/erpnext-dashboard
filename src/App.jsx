import { useState, useEffect } from 'react';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';

export default function App() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const saved = localStorage.getItem('erp_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch {
        localStorage.removeItem('erp_config');
      }
    }
  }, []);

  const handleSave = (cfg) => {
    setConfig(cfg);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('erp_config');
    setConfig(null);
  };

  if (!config) {
    return <Settings onSave={handleSave} />;
  }

  return <Dashboard config={config} onDisconnect={handleDisconnect} />;
}
