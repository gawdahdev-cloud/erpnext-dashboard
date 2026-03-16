import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // قراءة الـ URL من .env أو استخدام placeholder
  const ERP_URL = env.VITE_FRAPPE_URL || 'https://your-erp.frappe.cloud'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // ✅ الحل الكامل لـ CORS — كل requests بتمر عبر الـ Vite server
        '/api': {
          target: ERP_URL,
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            proxy.on('error', (err) => console.log('Proxy error:', err));
            proxy.on('proxyReq', (_, req) => console.log('→ Proxy:', req.url));
          },
        },
      },
    },
  }
})
