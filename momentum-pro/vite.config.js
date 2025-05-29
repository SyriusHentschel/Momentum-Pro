import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'post-build-cleanup',
      closeBundle() {
        // Ensure _redirects file is copied to the dist folder
        const publicDir = path.resolve(__dirname, 'public')
        const distDir = path.resolve(__dirname, 'dist')
        
        // Copy _redirects file
        if (fs.existsSync(path.join(publicDir, '_redirects'))) {
          fs.copyFileSync(
            path.join(publicDir, '_redirects'),
            path.join(distDir, '_redirects')
          )
          console.log('✓ _redirects file copied to dist folder')
        }
        
        // Create a version marker file to verify deployment
        fs.writeFileSync(
          path.join(distDir, 'version-marker.txt'),
          `Version: ${new Date().toISOString()}\nDeployed: ${new Date().toString()}`,
          'utf8'
        )
        console.log('✓ Version marker file created')
        
        // Ensure cleanup.html and reset.html redirect to the main app
        const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0;url=/" />
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to main application...</p>
  <script>
    window.location.href = '/';
  </script>
</body>
</html>`;
        
        // Write redirect HTML to cleanup.html and reset.html
        fs.writeFileSync(path.join(distDir, 'cleanup.html'), redirectHtml, 'utf8');
        fs.writeFileSync(path.join(distDir, 'reset.html'), redirectHtml, 'utf8');
        console.log('✓ Redirect files updated')
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
