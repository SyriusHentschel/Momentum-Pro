// This script runs after the build process on Netlify
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the dist directory exists
const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory does not exist!');
  process.exit(1);
}

// Create _redirects file if it doesn't exist
const redirectsPath = path.join(distDir, '_redirects');
if (!fs.existsSync(redirectsPath)) {
  console.log('Creating _redirects file...');
  fs.writeFileSync(
    redirectsPath,
    '/* /index.html 200',
    'utf8'
  );
  console.log('✅ _redirects file created');
} else {
  console.log('✅ _redirects file already exists');
}

// Copy _redirects from public directory if it exists
const publicRedirectsPath = path.join(__dirname, 'public', '_redirects');
if (fs.existsSync(publicRedirectsPath)) {
  console.log('Copying _redirects from public directory...');
  fs.copyFileSync(publicRedirectsPath, redirectsPath);
  console.log('✅ _redirects file copied from public directory');
}

// Verify index.html exists
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('✅ index.html exists');
} else {
  console.error('❌ index.html is missing!');
}

console.log('Netlify post-build process complete');