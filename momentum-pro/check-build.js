// Simple script to check if _redirects file exists in the dist folder
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const redirectsPath = path.join(distDir, '_redirects');

console.log('Checking build directory...');

if (fs.existsSync(distDir)) {
  console.log('✅ dist directory exists');
} else {
  console.error('❌ dist directory does not exist');
  process.exit(1);
}

if (fs.existsSync(redirectsPath)) {
  console.log('✅ _redirects file exists in dist folder');
  const content = fs.readFileSync(redirectsPath, 'utf8');
  console.log('_redirects content:');
  console.log(content);
} else {
  console.error('❌ _redirects file is missing from dist folder');
  
  // Create it if missing
  console.log('Creating _redirects file...');
  fs.writeFileSync(
    redirectsPath,
    '/* /index.html 200',
    'utf8'
  );
  console.log('✅ _redirects file created');
}