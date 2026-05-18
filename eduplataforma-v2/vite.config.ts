import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EduPlataforma v2.0',
        short_name: 'EduPlata',
        description: 'Tu escuela, sin límites',
        theme_color: '#1a6fa8',
        background_color: '#f2f6fb',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/slmbeartbgkihoznylly\.supabase\.co\/rest\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-data',
              networkTimeoutSeconds: 5,
              expiration: { maxAgeSeconds: 86400 }
            }
          },
          {
            urlPattern: /^https:\/\/slmbeartbgkihoznylly\.supabase\.co\/storage\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'materiales-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 604800 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'fonts-cache', expiration: { maxAgeSeconds: 2592000 } }
          }
        ]
      }
    })
  ]
})
