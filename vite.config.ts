import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';

const pwa = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
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
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl({}), pwa],
  server: {
    host: '0.0.0.0',
    https: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 443,
  },
});
