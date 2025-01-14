import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      external: ['axios', 'lucide-react'],
      output: {
        globals: {
          axios: 'axios',
          'lucide-react': 'lucide'
        }
      }
    }
  },
  optimizeDeps: {
    include: ['axios', 'lucide-react']
  }
}) 