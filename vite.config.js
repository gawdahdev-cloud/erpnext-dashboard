import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// =====================================================
// ⬇️  ضع API Key و Secret لكل instance هنا
// =====================================================
export const INSTANCES = [
  {
    id: 'centre',
    name: 'المركز',
    shortName: 'المركز',
    url: 'https://Qu-centre.svu.edu.eg',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    color: '#27ADE1',
  },
  {
    id: 'pharma',
    name: 'كلية الصيدلة',
    shortName: 'الصيدلة',
    url: 'https://Qu-Pharma.svu.edu.eg',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    color: '#36B54A',
  },
  {
    id: 'media',
    name: 'كلية الإعلام',
    shortName: 'الإعلام',
    url: 'https://Qu-media.svu.edu.eg',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    color: '#7c3aed',
  },
  {
    id: 'medicine',
    name: 'كلية الطب',
    shortName: 'الطب',
    url: 'https://Qu-medicine.svu.edu.eg',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    color: '#e11d48',
  },
  {
    id: 'sposci',
    name: 'كلية علوم الرياضة',
    shortName: 'الرياضة',
    url: 'https://Qu-sposci.svu.edu.eg',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    color: '#ea580c',
  },
  {
    id: 'science',
    name: 'كلية العلوم',
    shortName: 'العلوم',
    url: 'https://Qu-science.svu.edu.eg',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    color: '#0891b2',
  },
  {
    id: 'dental',
    name: 'كلية طب الأسنان',
    shortName: 'الأسنان',
    url: 'https://Qu-dental.svu.edu.eg',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    color: '#be185d',
  },
  {
    id: 'pt',
    name: 'كلية العلاج الطبيعي',
    shortName: 'العلاج الطبيعي',
    url: 'https://Qu-pt.svu.edu.eg',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    color: '#15803d',
  },
]

// =====================================================
// بيبني proxy entry لكل instance:
//   /proxy/centre/api/...  →  https://Qu-centre.svu.edu.eg/api/...
//   /proxy/pharma/api/...  →  https://Qu-Pharma.svu.edu.eg/api/...
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
  plugins: [react()],
  server: {
    port: 3000,
    proxy: buildProxy(),
  },

  // نمرر بيانات الـ instances للـ React app (بدون secrets)
  define: {
    __INSTANCES__: JSON.stringify(
      INSTANCES.map(({ id, name, shortName, color, apiKey, apiSecret }) => ({
        id,
        name,
        shortName,
        color,
        apiKey,
        apiSecret,
        proxyBase: `/proxy/${id}`,
      }))
    ),
  },
})
