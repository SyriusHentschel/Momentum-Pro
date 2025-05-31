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

// Copy build-verification.html from public directory if it exists
const publicVerificationPath = path.join(__dirname, 'public', 'build-verification.html');
const distVerificationPath = path.join(distDir, 'build-verification.html');
if (fs.existsSync(publicVerificationPath)) {
  console.log('Copying build-verification.html from public directory...');
  fs.copyFileSync(publicVerificationPath, distVerificationPath);
  console.log('✅ build-verification.html file copied from public directory');
} else {
  console.error('❌ build-verification.html not found in public directory!');
}

// Copy _headers from public directory if it exists
const publicHeadersPath = path.join(__dirname, 'public', '_headers');
const distHeadersPath = path.join(distDir, '_headers');
if (fs.existsSync(publicHeadersPath)) {
  console.log('Copying _headers from public directory...');
  fs.copyFileSync(publicHeadersPath, distHeadersPath);
  console.log('✅ _headers file copied from public directory');
} else {
  // Create a _headers file with proper MIME types
  console.log('Creating _headers file with proper MIME types...');
  fs.writeFileSync(
    distHeadersPath,
    `/*
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff

/assets/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable

/assets/*.css
  Content-Type: text/css
  Cache-Control: public, max-age=31536000, immutable

/assets/*.woff2
  Content-Type: font/woff2
  Cache-Control: public, max-age=31536000, immutable

/assets/*.woff
  Content-Type: font/woff
  Cache-Control: public, max-age=31536000, immutable

/assets/*.ttf
  Content-Type: font/ttf
  Cache-Control: public, max-age=31536000, immutable

/assets/*.eot
  Content-Type: application/vnd.ms-fontobject
  Cache-Control: public, max-age=31536000, immutable

/assets/*.svg
  Content-Type: image/svg+xml
  Cache-Control: public, max-age=31536000, immutable

/assets/*.png
  Content-Type: image/png
  Cache-Control: public, max-age=31536000, immutable

/assets/*.jpg
  Content-Type: image/jpeg
  Cache-Control: public, max-age=31536000, immutable

/assets/*.jpeg
  Content-Type: image/jpeg
  Cache-Control: public, max-age=31536000, immutable

/assets/*.gif
  Content-Type: image/gif
  Cache-Control: public, max-age=31536000, immutable

/assets/*.ico
  Content-Type: image/x-icon
  Cache-Control: public, max-age=31536000, immutable`,
    'utf8'
  );
  console.log('✅ _headers file created with proper MIME types');
}

// Create a static test page
const staticTestPath = path.join(distDir, 'static-test.html');
console.log('Creating static test page...');
fs.writeFileSync(
  staticTestPath,
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Static Test Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    .success {
      color: green;
      font-weight: bold;
    }
    .box {
      border: 1px solid #ddd;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Static Test Page</h1>
  <p>This is a simple static HTML page with no JavaScript dependencies.</p>
  
  <div class="box">
    <h2>Deployment Test</h2>
    <p class="success">✓ If you can see this page, basic HTML deployment is working correctly.</p>
    <p>This page was generated at build time and should always be accessible.</p>
  </div>
  
  <div class="box">
    <h2>Navigation Links</h2>
    <ul>
      <li><a href="/">Home Page</a></li>
      <li><a href="/netlify-debug.html">Debug Page</a></li>
      <li><a href="/build-verification.html">Build Verification</a></li>
    </ul>
  </div>
  
  <div class="box">
    <h2>Deployment Information</h2>
    <p>Static test page version: 1.0.0</p>
    <p>Deployment timestamp: ${new Date().toISOString()}</p>
    <p>Test ID: STATIC-TEST-001</p>
  </div>
</body>
</html>`,
  'utf8'
);
console.log('✅ static-test.html created');

// Create a Netlify debug page
const netlifyDebugPath = path.join(distDir, 'netlify-debug.html');
console.log('Creating Netlify debug page...');
fs.writeFileSync(
  netlifyDebugPath,
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Netlify Debug Page</title>
  <style>
    body {
      font-family: monospace;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    .debug-info {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
      white-space: pre-wrap;
    }
    .header {
      font-weight: bold;
      color: #2c3e50;
    }
  </style>
</head>
<body>
  <h1>Netlify Debug Page</h1>
  <p>This page displays information about the current deployment environment.</p>
  
  <h2>Build Information</h2>
  <div class="debug-info">
    <div class="header">Build Time:</div>
    ${new Date().toString()}
    
    <div class="header">Build ID:</div>
    NETLIFY-DEBUG-001
  </div>
  
  <h2>Headers Test</h2>
  <p>This section helps verify that the correct headers are being applied:</p>
  <div class="debug-info">
    <div class="header">JavaScript MIME Type:</div>
    application/javascript
    
    <div class="header">CSS MIME Type:</div>
    text/css
    
    <div class="header">Cache Control (Assets):</div>
    public, max-age=31536000, immutable
    
    <div class="header">Cache Control (HTML):</div>
    public, max-age=0, must-revalidate
  </div>
  
  <p><a href="/">Return to Home Page</a></p>
  <p><a href="/static-test.html">View Static Test Page</a></p>
</body>
</html>`,
  'utf8'
);
console.log('✅ netlify-debug.html created');

// Verify index.html exists
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('✅ index.html exists');
} else {
  console.error('❌ index.html is missing!');
}

console.log('Netlify post-build process complete');