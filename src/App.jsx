import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser]       = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // لو في session محفوظة نروح للداشبورد مباشرة
    const saved = sessionStorage.getItem('erp_user');
    if (saved) setUser(saved);
    setChecking(false);
  }, []);

  const handleLogin = (username) => {
    sessionStorage.setItem('erp_user', username);
    setUser(username);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('erp_user');
    setUser(null);
  };

  if (checking) return null;

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}
