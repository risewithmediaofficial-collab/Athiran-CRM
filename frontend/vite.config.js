import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@services': path.resolve(__dirname, './src/services'),
      '@api': path.resolve(__dirname, './src/api'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@validators': path.resolve(__dirname, './src/validators'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')
          const pkgPath = normalizedId.split('/node_modules/').pop()
          if (!normalizedId.includes('/node_modules/') || !pkgPath) return

          // Match specific packages BEFORE core "react" so substring "react"
          // in @tanstack/react-query, @radix-ui/react-select, lucide-react,
          // and react-hook-form never collapses into vendor-react.
          if (pkgPath.startsWith('@tanstack/')) {
            return 'vendor-query'
          }
          if (
            pkgPath.startsWith('@radix-ui/') ||
            pkgPath.startsWith('lucide-react/') ||
            pkgPath.startsWith('@floating-ui/') ||
            pkgPath.startsWith('react-remove-scroll') ||
            pkgPath.startsWith('use-sidecar/') ||
            pkgPath.startsWith('use-callback-ref/') ||
            pkgPath.startsWith('aria-hidden/') ||
            pkgPath.startsWith('clsx/') ||
            pkgPath.startsWith('tailwind-merge/')
          ) {
            return 'vendor-ui'
          }
          if (
            pkgPath.startsWith('react-hook-form/') ||
            pkgPath.startsWith('@hookform/') ||
            pkgPath.startsWith('zod/')
          ) {
            return 'vendor-forms'
          }
          if (pkgPath.startsWith('axios/') || pkgPath.startsWith('dayjs/')) {
            return 'vendor-utils'
          }
          if (
            pkgPath.startsWith('react/') ||
            pkgPath.startsWith('react-dom/') ||
            pkgPath.startsWith('scheduler/') ||
            pkgPath.startsWith('react-router/') ||
            pkgPath.startsWith('react-router-dom/') ||
            pkgPath.startsWith('@remix-run/router/')
          ) {
            return 'vendor-react'
          }
        },
      },
    },
  },
})

