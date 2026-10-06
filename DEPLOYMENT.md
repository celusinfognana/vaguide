# Deployment Guide - Property Support Hub

## Overview

The Property Support Hub is a modern React application built with Vite, Tailwind CSS, and React hooks. It's a frontend-only application with no backend dependencies.

## Local Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup

```bash
cd "VA userguide"
npm install
npm run dev
```

Access at: http://localhost:3000

## Building for Production

### Create Optimized Build

```bash
npm run build
```

This generates:
- Optimized production-ready files in `dist/` directory
- Minified CSS and JavaScript
- Optimized images and assets
- ~150KB gzipped bundle size

### Preview Production Build Locally

```bash
npm run preview
```

## Deployment Options

### Option 1: Netlify (Recommended for Frontend)

#### Prerequisites
- Netlify account (free tier available)
- Git repository

#### Steps

1. **Connect Repository**
   - Push code to GitHub
   - Go to netlify.com
   - Click "New site from Git"
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Deploy**
   - Netlify automatically deploys on git push
   - URL provided (e.g., `https://property-support-hub.netlify.app`)

#### Environment Variables
- If using `.env` files, add to Netlify Build Environment section

### Option 2: Vercel

#### Prerequisites
- Vercel account
- Git repository

#### Steps

1. **Import Project**
   - Go to vercel.com
   - Click "Import Project"
   - Select your Git provider
   - Select your repository

2. **Configure**
   - Framework: Vite
   - Vercel auto-detects build configuration
   - Click Deploy

#### Features
- Automatic deployments on git push
- Preview deployments for pull requests
- Edge Functions for backend (future)

### Option 3: GitHub Pages

#### Prerequisites
- GitHub repository

#### Steps

1. **Update vite.config.js**
   ```javascript
   export default defineConfig({
     base: '/repository-name/',
     plugins: [react()],
   })
   ```

2. **Add Deploy Script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repository Settings
   - GitHub Pages → Source: gh-pages branch

### Option 4: AWS (S3 + CloudFront)

#### Prerequisites
- AWS account
- AWS CLI configured

#### Steps

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3api create-bucket \
     --bucket property-support-hub \
     --region us-east-1
   ```

3. **Enable Static Website Hosting**
   ```bash
   aws s3 website s3://property-support-hub/ \
     --index-document index.html \
     --error-document index.html
   ```

4. **Upload Build Files**
   ```bash
   aws s3 sync dist/ s3://property-support-hub/ \
     --delete \
     --cache-control "max-age=2592000"
   ```

5. **Set Index Fallback (for SPA routing)**
   - Bucket Policy: Allow all GetObject
   - CloudFront Error Responses: 404 → /index.html

6. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Cache Policy: Managed-CachingOptimized
   - Enable HTTPS

### Option 5: Docker + Any Cloud Provider

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### Build and Run

```bash
docker build -t property-support-hub .
docker run -p 3000:3000 property-support-hub
```

#### Deploy to Cloud
- Docker Hub → Kubernetes, AWS ECS, or similar
- Google Cloud Run: `gcloud run deploy`
- Azure Container Instances: Azure Portal

### Option 6: Traditional Web Server

#### Apache

```apache
<VirtualHost *:80>
    ServerName property-support-hub.example.com
    DocumentRoot /var/www/property-support-hub/dist

    <Directory /var/www/property-support-hub/dist>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    <IfModule mod_gzip.c>
        mod_gzip_on Yes
        mod_gzip_comp_level 6
        mod_gzip_types text/plain text/css text/javascript
    </IfModule>
</VirtualHost>
```

#### Nginx

```nginx
server {
    listen 80;
    server_name property-support-hub.example.com;
    root /var/www/property-support-hub/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    gzip_min_length 1000;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location ~* \.html?$ {
        expires -1;
        add_header Cache-Control "public, must-revalidate, proxy-revalidate";
    }
}
```

## Environment Variables

Create `.env.production` for production:

```env
VITE_API_BASE_URL=https://api.property-support-hub.com
VITE_API_TIMEOUT=30000
VITE_ENVIRONMENT=production
VITE_USE_MOCK_DATA=false
```

## Performance Optimization

### Bundle Analysis

```bash
npm install --save-dev rollup-plugin-visualizer
```

Add to vite.config.js:
```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    react(),
    visualizer()
  ]
}
```

### Lazy Loading Components

```javascript
import { lazy, Suspense } from 'react'
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'))

// Usage
<Suspense fallback={<Loading />}>
  <PropertiesPage />
</Suspense>
```

### Code Splitting

Vite automatically splits code, but you can optimize further:

```javascript
// Dynamic imports
const WorkflowRunner = () => import('../components/WorkflowRunner')
```

## Monitoring & Analytics

### Add Sentry for Error Tracking

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.VITE_ENVIRONMENT,
})
```

### Add Google Analytics

```javascript
// In App.jsx
useEffect(() => {
  window.gtag?.('config', 'GA_ID')
}, [])
```

## Security

### Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **CSP Headers**: Implement Content Security Policy
3. **CORS**: Configure CORS for any future backend
4. **Dependencies**: Keep npm packages updated
   ```bash
   npm audit
   npm audit fix
   npm update
   ```

### Security Headers (Nginx)

```nginx
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Rollback & Versioning

- **Netlify/Vercel**: Automatic rollback to previous deployment
- **GitHub Pages**: Revert commit and redeploy
- **S3**: Versioning enabled, restore previous object versions
- **Docker**: Tag images with version: `v1.0.0`, revert to previous tag

## Maintenance

### Regular Updates

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Major version updates (with testing)
npm upgrade package-name@latest
```

### Performance Monitoring

- Monitor bundle size over time
- Use Lighthouse CI for performance regression testing
- Monitor Core Web Vitals with web-vitals

## Troubleshooting

### Common Issues

**Blank Page After Deploy**
- Check browser console for errors
- Verify correct base path in vite.config.js
- Clear browser cache

**CSS/JS Not Loading**
- Verify asset paths are relative (not absolute)
- Check Content-Security-Policy headers
- Verify MIME types on web server

**SPA Routes Not Working**
- Ensure all routes fallback to index.html
- Check web server configuration
- Test with `?_embed=true` parameter

## Support

For issues and questions, refer to:
- Vite Documentation: https://vitejs.dev
- React Documentation: https://react.dev
- Tailwind Documentation: https://tailwindcss.com

---

**Successfully deployed Property Support Hub!**
