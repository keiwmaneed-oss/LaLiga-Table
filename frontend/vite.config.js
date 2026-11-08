
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/teams': 'http://localhost:3000',
      '/scorers': 'http://localhost:3000',
      '/teamqueue': 'http://localhost:3000',
      '/history': 'http://localhost:3000',
      '/undo': 'http://localhost:3000'
    }
  }
})
