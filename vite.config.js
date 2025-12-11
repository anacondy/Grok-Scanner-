import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
const REPO_NAME = '/Grok-Scanner-/'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  const isGitHubPages = isProduction && import.meta.env?.VITE_GITHUB_PAGES === 'true'
  return {
  plugins: [react()],
  base: isGitHubPages ? REPO_NAME : './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
}})
