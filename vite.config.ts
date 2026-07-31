import { defineConfig } from 'vite'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enablePwa = env.VITE_ENABLE_PWA === 'true'

  return {
    plugins: [
      react(),
      ...(enablePwa
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: ['favicon.svg', 'robots.txt', 'offline.html', 'icons/*.svg'],
              manifest: {
                name: 'EduLite - Platform Sekolah Digital',
                short_name: 'EduLite',
                description: 'Platform LMS untuk Sekolah Dasar',
                theme_color: '#3F51B5',
                background_color: '#F5F7FA',
                display: 'standalone',
                start_url: '/',
                lang: 'id',
                icons: [
                  { src: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
                  { src: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
                  { src: '/icons/icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
                ],
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                // Navigation fallback must point to the SPA shell, not offline page.
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api\//],
              },
              devOptions: {
                enabled: false,
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: { '@': path.resolve(dirname, './src') },
    },
    server: {
      port: 5173,
      host: true,
    },
  }
})
