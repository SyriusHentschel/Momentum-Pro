import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Building with environment variables:')
  console.log('VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? 'Set' : 'Not set')
  console.log('VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
  console.log('VITE_AUTH_REDIRECT_URL:', env.VITE_AUTH_REDIRECT_URL ? 'Set' : 'Not set')
  
  return {
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
        const buildTimestamp = new Date().getTime();
        fs.writeFileSync(
          path.join(distDir, 'version-marker.txt'),
          `Version: ${buildTimestamp}\nDeployed: ${new Date().toString()}\nCommit: ${process.env.COMMIT_REF || 'local-build'}`,
          'utf8'
        )
        
        // Create an environment check file
        fs.writeFileSync(
          path.join(distDir, 'env-check.txt'),
          `Build Time: ${new Date().toString()}
Supabase URL: ${process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set'}
Supabase Anon Key: ${process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
Auth Redirect URL: ${process.env.VITE_AUTH_REDIRECT_URL ? 'Set' : 'Not set'}
Node Version: ${process.version}
`,
          'utf8'
        )
        
        // Create a cache-busting file that Netlify will recognize
        fs.writeFileSync(
          path.join(distDir, '_headers'),
          `/*
  Cache-Control: public, max-age=0, must-revalidate
  
/assets/*
  Cache-Control: public, max-age=31536000, immutable
`,
          'utf8'
        )
        console.log('✓ Version marker and cache headers created')
        
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
