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
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /[\\/]node_modules[\\/](?:react|react-dom|scheduler|react-router|react-router-dom|@remix-run[\\/]router)[\\/]/,
              priority: 50,
            },
            {
              name: 'vendor-query',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              priority: 40,
            },
            {
              name: 'vendor-ui',
              test: /[\\/]node_modules[\\/](?:@radix-ui|lucide-react|@floating-ui|react-remove-scroll(?:-bar)?|react-style-singleton|use-sidecar|use-callback-ref|aria-hidden|clsx|tailwind-merge)[\\/]/,
              priority: 30,
            },
            {
              name: 'vendor-forms',
              test: /[\\/]node_modules[\\/](?:react-hook-form|@hookform|zod)[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-utils',
              test: /[\\/]node_modules[\\/](?:axios|dayjs)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})

