// Simple script to verify build contents
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, 'dist');

console.log('Checking build directory contents...');

if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory does not exist!');
  process.exit(1);
}

// Check for index.html
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('✅ index.html exists');
} else {
  console.error('❌ index.html is missing!');
}

// Check for _redirects
if (fs.existsSync(path.join(distDir, '_redirects'))) {
  console.log('✅ _redirects exists');
  const redirectsContent = fs.readFileSync(path.join(distDir, '_redirects'), 'utf8');
  console.log('_redirects content:', redirectsContent);
} else {
  console.error('❌ _redirects is missing!');
  
  // Create it if missing
  console.log('Creating _redirects file...');
  fs.writeFileSync(
    path.join(distDir, '_redirects'),
    '/* /index.html 200',
    'utf8'
  );
  console.log('✅ _redirects file created');
}

console.log('Build verification complete');