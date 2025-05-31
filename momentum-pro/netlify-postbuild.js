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
    `# Netlify redirects file
# This ensures that all routes are handled by the Vue Router

# Make sure assets are served directly
/assets/*  /assets/:splat  200
/*.js      /:splat        200
/*.css     /:splat        200

# Handle all other routes with the Vue Router
/*    /index.html   200!`,
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
  X-Content-Type-Options: nosniff

/*.js
  Content-Type: application/javascript; charset=utf-8

/assets/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

/assets/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable`,
    'utf8'
  );
  console.log('✅ _headers file created with proper MIME types');
}

// Create netlify.toml file in dist directory
const netlifyTomlPath = path.join(distDir, 'netlify.toml');
console.log('Creating netlify.toml file...');
fs.writeFileSync(
  netlifyTomlPath,
  `# Netlify configuration file for the dist folder

# Ensure all routes are handled by the Vue Router
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true

# Special handling for JavaScript files
[[headers]]
  for = "**/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/assets/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"
    Cache-Control = "public, max-age=31536000, immutable"
    X-Content-Type-Options = "nosniff"

# Special handling for CSS files
[[headers]]
  for = "**/*.css"
  [headers.values]
    Content-Type = "text/css; charset=utf-8"
    Cache-Control = "public, max-age=31536000, immutable"

# Disable cache for HTML and root files
[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    X-Content-Type-Options = "nosniff"`,
  'utf8'
);
console.log('✅ netlify.toml file created');

// Verify index.html exists
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('✅ index.html exists');
} else {
  console.error('❌ index.html is missing!');
}

console.log('Netlify post-build process complete');