import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Mengarahkan semua request yang diawali dengan '/api' ke server backend
      '/api': {
        target: 'http://localhost:8000', // ⚠️ GANTI dengan URL & Port Backend kamu (misal port Laravel 8000, atau Express 5000)
        changeOrigin: true,
        secure: false,
      },
    },
  },
})