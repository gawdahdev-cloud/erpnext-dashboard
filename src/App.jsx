
import React, { useState, useEffect, Suspense } from 'react';
import { initFrappe, handleLoginRedirect, getFrappe, logout } from './lib/frappe';

// ✨ تطبيق التحميل المتأخر للمكونات الرئيسية
const Login = React.lazy(() => import('./components/Login'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));

// مكون بسيط لعرض شاشة التحميل
const LoadingScreen = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
    <p>جاري تحميل التطبيق...</p>
  </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // تهيئة Frappe App مرة واحدة عند بدء تشغيل التطبيق
    initFrappe();

    async function checkLoginStatus() {
      try {
        // 1. التحقق مما إذا كان المستخدم عائداً من صفحة تسجيل الدخول
        const loggedInViaRedirect = await handleLoginRedirect();
        
        if (loggedInViaRedirect) {
          console.log('تم تسجيل الدخول بنجاح عبر OAuth');
          setIsLoggedIn(true);
        } else {
          // 2. إذا لم يكن عائداً، التحقق مما إذا كان لديه جلسة نشطة
          const frappe = getFrappe();
          const loggedIn = await frappe.auth().isLoggedIn();
          setIsLoggedIn(loggedIn);
        }

        // 3. إذا كان مسجلاً دخوله، جلب بيانات المستخدم
        if (await getFrappe().auth().isLoggedIn()) {
          const currentUser = await getFrappe().auth().getLoggedInUser();
          setUser(currentUser);
        }

      } catch (error) {
        console.error('حدث خطأ أثناء التحقق من حالة تسجيل الدخول:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('حدث خطأ أثناء تسجيل الخروج:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {isLoggedIn 
        ? <Dashboard user={user} onLogout={handleLogout} /> 
        : <Login />
      }
    </Suspense>
  );
}
