import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const pwa = await VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['**/*'],
  injectRegister: 'auto',
  manifest: {
    name: 'マンガ',
    short_name: 'MANGA',
    description: '家族用',
    theme_color: '#ffffff',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*'],
    globIgnores: ['**/*.epub'],
    maximumFileSizeToCacheInBytes: 1024 * 1024 * 1024 * 1,
    navigateFallback: '/index.html',
    runtimeCaching: [
      {
        urlPattern: /.+(.png)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'thumbnail',
          expiration: {
            maxEntries: 1000,
            maxAgeSeconds: 60 * 60 * 24 * 365 * 2, // 2 years
          },
          cacheableResponse: {
            statuses: [200],
          },
          rangeRequests: true,
        },
      },
      {
        urlPattern: /.+(\/api\/book)$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'index',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 * 2, // 2 years
          },
          cacheableResponse: {
            statuses: [200],
          },
          rangeRequests: true,
        },
      },
      {
        urlPattern: /.+\/api\/book\/.+$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'epub',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365 * 2, // 2 years
          },
          cacheableResponse: {
            statuses: [200],
          },
          rangeRequests: true,
        },
      },
    ],
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pwa],
  optimizeDeps: {
    include: ['@epub/lib'],
  },
  build: {
    commonjsOptions: {
      include: [/lib/, /node_modules/],
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/thumbnail': {
        secure: false,
        target: 'http://localhost:8080',
      },
      '/api': {
        secure: false,
        target: 'http://localhost:8080',
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 443,
    // https: {
    //   cert: fs.readFileSync('./cert/raspberrypi.local.pem'),
    //   key: fs.readFileSync('./cert/raspberrypi.local-key.pem'),
    // },
  },
})
