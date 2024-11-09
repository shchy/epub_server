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
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pwa],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/trpc': {
        secure: false,
        target: 'http://localhost:3000',
      },
      '/thumbnail': {
        secure: false,
        target: 'http://localhost:3000',
      },
    },
    // cors: {
    //   origin: '*',
    //   // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    //   // preflightContinue: false,
    //   // optionsSuccessStatus: 204,
    // },
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
