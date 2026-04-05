import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/settings': 'http://localhost:3333',
      '/api/channels': 'http://localhost:3333',
      '/api/oauth': 'http://localhost:3333',
      '/api/files': 'http://localhost:3333',
      '/api/upload': 'http://localhost:3333',
      '/api/logs': 'http://localhost:3333',
      '/api': 'http://localhost:8000',
    },
  },
})
