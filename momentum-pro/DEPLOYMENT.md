# Momentum Pro Deployment Guide

This guide provides comprehensive step-by-step instructions for deploying Momentum Pro to Netlify.

## Prerequisites

Before deploying, ensure you have:

1. A Supabase project set up with the necessary tables and authentication providers
2. Updated environment variables for production
3. Completed all testing according to the [Testing Plan](testing-plan.md)
4. Node.js and npm installed on your local machine
5. Git repository with your latest code changes committed

## Supabase Configuration

### Database Setup

Ensure your Supabase project has the following tables:

1. **profiles**
   - `id`: UUID (references auth.users.id)
   - `display_name`: Text
   - `bio`: Text
   - `avatar_url`: Text
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

2. **tasks**
   - `id`: UUID
   - `user_id`: UUID (references auth.users.id)
   - `title`: Text
   - `description`: Text
   - `is_complete`: Boolean
   - `importance`: Text ('low', 'medium', 'high')
   - `due_date`: Timestamp
   - `position`: Integer
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

3. **preferences**
   - `id`: UUID
   - `user_id`: UUID (references auth.users.id)
   - `theme`: Text
   - `default_filter`: Text
   - `default_sort`: Text
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

### Authentication Setup

1. Enable the following authentication providers in Supabase:
   - Email/Password
   - GitHub (if using OAuth)

2. Configure authentication redirect URLs:
   - Add your production URL to the list of allowed redirect URLs
   - Format: `https://your-netlify-domain.netlify.app/auth/callback`

3. Set up email templates for:
   - Confirmation emails
   - Password reset emails

## Build Process

1. Update the `.env.production` file with your production environment variables:
   ```
   VITE_SUPABASE_URL=your_production_supabase_url
   VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
   VITE_AUTH_REDIRECT_URL=https://your-netlify-domain.netlify.app/auth/callback
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. The built files will be in the `dist` directory, ready for deployment.

5. Test the build locally (optional):
   ```bash
   npm run preview
   ```

## Deployment to Netlify

### Netlify Deployment Steps

1. Create a new site on Netlify
   - Log in to your Netlify account
   - Click "New site from Git"
   - Select GitHub as your Git provider
   - Authorize Netlify to access your GitHub account
   - Select the Momentum Pro repository

2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node.js version: 16.x (or your preferred version)

3. Configure environment variables:
   - Go to Site settings > Build & deploy > Environment
   - Add the following environment variables:
     ```
     VITE_SUPABASE_URL=your_production_supabase_url
     VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
     VITE_AUTH_REDIRECT_URL=https://your-netlify-domain.netlify.app/auth/callback
     ```

4. Configure redirect rules:
   - The project already includes a `netlify.toml` file with the necessary configuration
   - This ensures that all routes are handled by the Vue Router
   - There's also a backup `_redirects` file in the public directory

5. Deploy the site:
   - Commit and push your changes to GitHub
   - Netlify will automatically build and deploy your site
   - You can also trigger manual deploys from the Netlify dashboard

### Custom Domain Setup (Optional)

1. Purchase a domain name from a domain registrar
2. In Netlify, go to Site settings > Domain management > Custom domains
3. Click "Add custom domain" and enter your domain name
4. Follow Netlify's instructions to configure DNS settings with your domain provider
5. Once the domain is verified, update your environment variables:
   ```
   VITE_AUTH_REDIRECT_URL=https://your-custom-domain.com/auth/callback
   ```
6. Redeploy your application

## Post-Deployment Tasks

### Testing the Deployed Application

1. Test user authentication:
   - Register a new account
   - Log in with existing account
   - Test password reset functionality
   - Test GitHub OAuth (if configured)

2. Test task management:
   - Create new tasks
   - Edit existing tasks
   - Delete tasks
   - Mark tasks as complete/incomplete
   - Test filtering and sorting

3. Test user preferences:
   - Change theme
   - Set default filters and sorting
   - Update profile information

4. Test responsive design:
   - Test on desktop, tablet, and mobile devices
   - Verify that all features work correctly on all device sizes

### Security Verification

1. Verify that developer mode is only accessible to authorized users
2. Check that authentication tokens are stored securely
3. Ensure that API endpoints are protected against unauthorized access
4. Verify that sensitive data is not exposed in client-side code

### Performance Optimization

1. Run Lighthouse audit to identify performance issues
2. Optimize images and other assets if necessary
3. Implement any recommended performance improvements
4. Test loading times on various devices and network conditions

## Troubleshooting Common Issues

### Authentication Issues

If users cannot log in or register:
1. Verify that Supabase environment variables are correct
2. Check that authentication redirect URLs are properly configured
3. Ensure that CORS settings in Supabase allow your domain
4. Check browser console for any JavaScript errors

### Missing or Broken Features

If certain features don't work in production:
1. Compare the production environment with development
2. Check for environment-specific code that might be causing issues
3. Verify that all required environment variables are set
4. Test the specific feature in development to isolate the issue

### Styling or Layout Issues

If the application doesn't look right:
1. Clear browser cache and reload
2. Test in different browsers to identify browser-specific issues
3. Check for CSS conflicts or missing styles
4. Verify that all assets are loading correctly

## Maintenance and Updates

### Deploying Updates

1. Make and test changes locally
2. Commit changes to your repository
3. Push changes to GitHub
4. Netlify will automatically build and deploy the updated site

### Monitoring

1. Set up uptime monitoring to ensure the site is always available
2. Implement error tracking to catch and fix issues quickly
3. Monitor performance metrics to identify areas for improvement
4. Regularly check Supabase usage and quotas

## Backup and Recovery

1. Regularly export Supabase data for backup
2. Document the deployment process for quick recovery if needed
3. Keep track of all environment variables and configuration settings
4. Maintain a rollback plan for critical updates

## Post-Deployment Tasks

After deploying to your chosen platform:

1. **Test the live application**:
   - Verify all features work correctly
   - Test authentication flows
   - Check that environment variables are correctly applied

2. **Set up monitoring**:
   - Add error tracking with a service like Sentry
   - Configure performance monitoring
   - Set up uptime monitoring

3. **Configure custom domain** (if applicable):
   - Add your domain in your hosting platform's settings
   - Configure DNS settings with your domain provider
   - Set up SSL certificate

4. **Update documentation**:
   - Update the README with the production URL
   - Document any environment-specific considerations

## Troubleshooting Common Deployment Issues

### Authentication Redirect Issues

If authentication redirects aren't working:
1. Verify that `VITE_AUTH_REDIRECT_URL` points to your production domain
2. Check that the redirect URL is configured in your Supabase project
3. Ensure your hosting platform is correctly handling SPA routing

### API Connection Issues

If the application can't connect to Supabase:
1. Verify that environment variables are correctly set
2. Check CORS configuration in your Supabase project
3. Ensure the Supabase project is on a paid plan if you're experiencing rate limits

### Static Asset Loading Issues

If static assets aren't loading:
1. Check that the `base` path in `vite.config.js` is correct
2. Verify that assets are included in the build
3. Check for path issues in your CSS and JavaScript

## Maintenance and Updates

To update the deployed application:

1. Make and test changes locally
2. Commit changes to your repository
3. If using CI/CD, the deployment should happen automatically
4. If deploying manually, run the build and deploy commands again

## Rollback Procedure

If you need to rollback to a previous version:

1. Identify the last working commit
2. Checkout that commit:
   ```bash
   git checkout <commit-hash>
   ```
3. Rebuild and redeploy the application
4. Once issues are fixed, merge the fixes and deploy the updated version