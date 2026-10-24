/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'ai-catalog-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url || '', 'http://localhost')
          if (url.pathname === '/.well-known/ai-catalog.json' || url.pathname === '/ai-catalog.json') {
            const manifestPath = path.resolve(__dirname, 'public/ai-catalog.json')
            if (fs.existsSync(manifestPath)) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.setHeader('Cache-Control', 'no-cache')
              res.end(fs.readFileSync(manifestPath, 'utf8'))
              return
            }
          }
          next()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url || '', 'http://localhost')
          if (url.pathname === '/.well-known/ai-catalog.json' || url.pathname === '/ai-catalog.json') {
            const manifestPath = path.resolve(__dirname, 'public/ai-catalog.json')
            if (fs.existsSync(manifestPath)) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.setHeader('Cache-Control', 'no-cache')
              res.end(fs.readFileSync(manifestPath, 'utf8'))
              return
            }
          }
          next()
        })
      },
    },
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
