
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

// =====================================================
// ⬇️ Client ID مأخوذ من Frappe Connected App
// =====================================================
export const OAUTH_CLIENT_ID = 'imato28rlj';

// =====================================================
// قائمة الـ instances (بدون أي بيانات سرية)
// =====================================================
export const INSTANCES = [
  {
    id: 'centre',
    name: 'المركز',
    shortName: 'المركز',
    url: 'https://Qu-centre.svu.edu.eg',
    color: '#27ADE1',
  },
  {
    id: 'pharma',
    name: 'كلية الصيدلة',
    shortName: 'الصيدلة',
    url: 'https://Qu-Pharma.svu.edu.eg',
    color: '#36B54A',
  },
  {
    id: 'media',
    name: 'كلية الإعلام',
    shortName: 'الإعلام',
    url: 'https://Qu-media.svu.edu.eg',
    color: '#7c3aed',
  },
  {
    id: 'medicine',
    name: 'كلية الطب',
    shortName: 'الطب',
    url: 'https://Qu-medicine.svu.edu.eg',
    color: '#e11d48',
  },
  {
    id: 'sposci',
    name: 'كلية علوم الرياضة',
    shortName: 'الرياضة',
    url: 'https://Qu-sposci.svu.edu.eg',
    color: '#ea580c',
  },
  {
    id: 'science',
    name: 'كلية العلوم',
    shortName: 'العلوم',
    url: 'https://Qu-science.svu.edu.eg',
    color: '#0891b2',
  },
  {
    id: 'dental',
    name: 'كلية طب الأسنان',
    shortName: 'الأسنان',
    url: 'https://Qu-dental.svu.edu.eg',
    color: '#be185d',
  },
  {
    id: 'pt',
    name: 'كلية العلاج الطبيعي',
    shortName: 'العلاج الطبيعي',
    url: 'https://Qu-pt.svu.edu.eg',
    color: '#15803d',
  },
]

// =====================================================
// بيبني proxy entry لكل instance:
//   /proxy/centre/api/...  →  https://Qu-centre.svu.edu.eg/api/...
// =====================================================
function buildProxy() {
  const proxy = {}
  for (const inst of INSTANCES) {
    proxy[`/proxy/${inst.id}`] = {
      target: inst.url,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(new RegExp(`^/proxy/${inst.id}`), ''),
      configure: (proxyServer) => {
        proxyServer.on('error', (err) => {
          console.error(`[proxy:${inst.id}] error:`, err.message)
        })
      },
    }
  }
  return proxy
}

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, filename: 'stats.html' }), // ✨ إضافة أداة تحليل الحجم
  ],
  server: {
    port: 3000,
    proxy: buildProxy(),
  },

  // نمرر البيانات الآمنة فقط للـ React app
  define: {
    __INSTANCES__: JSON.stringify(
      INSTANCES.map(({ id, name, shortName, color, url }) => ({
        id,
        name,
        shortName,
        color,
        url, // Make the URL available to the frontend
        proxyBase: `/proxy/${id}`,
      }))
    ),
    __OAUTH_CLIENT_ID__: JSON.stringify(OAUTH_CLIENT_ID),
  },

  // ✨ تحسينات الأداء التي اقترحتها
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // فصل المكتبات الأساسية في ملف منفصل
          vendor: ['react', 'react-dom', 'frappe-js-sdk'],
        },
      },
    },
  },
})
