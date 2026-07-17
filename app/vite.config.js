import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      host: mode === 'development' ? 'localhost' : '0.0.0.0',
      port: 5173,
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true
        }
      } : undefined
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: mode === 'production' ? {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            bootstrap: ['bootstrap']
          } : undefined
        }
      }
    }
  }
})
