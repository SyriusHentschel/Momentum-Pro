import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-redirects',
      closeBundle() {
        // Ensure _redirects file is copied to the dist folder
        const publicDir = path.resolve(__dirname, 'public')
        const distDir = path.resolve(__dirname, 'dist')
        
        if (fs.existsSync(path.join(publicDir, '_redirects'))) {
          fs.copyFileSync(
            path.join(publicDir, '_redirects'),
            path.join(distDir, '_redirects')
          )
          console.log('✓ _redirects file copied to dist folder')
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000
  }
})
