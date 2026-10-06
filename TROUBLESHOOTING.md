# Troubleshooting Guide

## Common Issues & Solutions

### Installation Issues

#### Problem: `npm install` fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### Problem: Node version compatibility
**Solution:**
```bash
# Check Node version
node --version

# Should be 16+
# Update Node if needed from nodejs.org
```

#### Problem: EACCES permission denied
**Solution:**
```bash
# Linux/Mac - Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

---

### Development Server Issues

#### Problem: Port 3000 already in use
**Solution:**
```bash
# Use different port
npm run dev -- --port 3001

# Or kill process using port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Problem: `[vite] Error when evaluating SSR module external`
**Solution:**
```bash
# Clear vite cache
rm -rf node_modules/.vite

# Reinstall
npm install
npm run dev
```

#### Problem: Hot Module Replacement (HMR) not working
**Solution:**
```bash
# Check firewall settings
# HMR uses WebSocket on port 24678
# Allow in firewall if needed

# Or configure explicit HMR host
# Edit vite.config.js:
export default defineConfig({
  server: {
    hmr: {
      host: 'localhost',
      port: 24678,
    }
  }
})
```

---

### Build Issues

#### Problem: `npm run build` fails
**Solution:**
```bash
# Check for syntax errors
npm run build -- --mode=development

# Check console for specific errors
# Common: typos in imports or undefined variables
```

#### Problem: Build output too large
**Solution:**
```bash
# Analyze bundle
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.js:
import { visualizer } from 'rollup-plugin-visualizer'

plugins: [
  visualizer()
]

# Run build and check report
npm run build
# Opens report in browser
```

#### Problem: Production build shows blank page
**Solution:**
```bash
# Check base path in vite.config.js
export default defineConfig({
  base: '/property-support-hub/', // If deploying to subdirectory
})

# Or check for console errors in DevTools
# F12 → Console tab
```

---

### UI/Display Issues

#### Problem: Tailwind CSS not applied
**Solution:**
```bash
# Rebuild CSS
rm -rf node_modules/.vite
npm run dev

# Check tailwind.config.js includes all template files:
content: [
  "./index.html",
  "./src/**/*.{js,jsx}",
]

# Restart dev server after changes to config
```

#### Problem: Icons not displaying
**Solution:**
```bash
# Check if lucide-react is installed
npm list lucide-react

# Reinstall if needed
npm install lucide-react

# Check import in component:
import { Home, Settings } from 'lucide-react'
```

#### Problem: Colors look wrong
**Solution:**
```bash
# Clear browser cache
Ctrl+Shift+Delete (or Cmd+Shift+Delete)

# Hard refresh
Ctrl+Shift+R (or Cmd+Shift+R)

# Check tailwind config colors:
tailwind.config.js
```

#### Problem: Layout broken on mobile
**Solution:**
```bash
# Check viewport meta tag in index.html:
<meta name="viewport" content="width=device-width, initial-scale=1.0">

# Inspect element (F12) → Device toolbar
# Test different screen sizes

# Check responsive classes in Tailwind:
md: (768px)
lg: (1024px)
xl: (1280px)
```

---

### Data & State Issues

#### Problem: Favorites don't persist after refresh
**Solution:**
This is by design - the app uses local React state.

To add persistence:
```javascript
// In App.jsx, add localStorage:
useEffect(() => {
  localStorage.setItem('favorites', JSON.stringify(favorites))
}, [favorites])

useEffect(() => {
  const saved = localStorage.getItem('favorites')
  if (saved) setFavorites(JSON.parse(saved))
}, [])
```

#### Problem: No data showing in dropdowns
**Solution:**
```bash
# Check mockData.jsx exists
# Verify imports in components:
import { mockProperties } from '../data/mockData'

# Check console for import errors (F12)
```

#### Problem: Search not finding items
**Solution:**
```javascript
// Check search query in GlobalSearchModal.jsx
// Ensure:
// 1. mockData is loaded
// 2. Query filters are correct
// 3. Keywords in procedures are populated

// Debug:
console.log(allProcedures) // Check data structure
```

---

### Performance Issues

#### Problem: App feels slow
**Solution:**
```bash
# Profile performance
npm run dev

# Open DevTools (F12) → Performance tab
# Record and check for long-running functions

# Common causes:
# - Too many re-renders
# - Large component trees
# - Unoptimized images
```

#### Problem: High memory usage
**Solution:**
```bash
# Monitor bundle size
npm run build

# Check dist/ folder size
# Should be ~150KB gzipped

# Lazy load components:
import { lazy, Suspense } from 'react'
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'))
```

#### Problem: Slow search
**Solution:**
```javascript
// Add debouncing to search:
import { useState, useEffect } from 'react'

const [query, setQuery] = useState('')
const [debouncedQuery, setDebouncedQuery] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(query)
  }, 300)
  return () => clearTimeout(timer)
}, [query])
```

---

### Browser Compatibility

#### Problem: Features not working in specific browser
**Solution:**
```bash
# Check browser support:
# Chrome 90+
# Firefox 88+
# Safari 14+
# Edge 90+

# Test in browser:
# Open DevTools
# Console for JavaScript errors
# Network tab for 404s
```

#### Problem: Flexbox/Grid not working
**Solution:**
```css
/* Ensure browser supports CSS Grid/Flexbox */
/* Add prefixes if needed */
display: -webkit-flex; /* Safari */
display: flex;
```

---

### Deployment Issues

#### Problem: 404 errors when refreshing URL
**Solution:**
This is a common SPA routing issue.

**For Netlify:**
```toml
# Create netlify.toml
[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

**For Vercel:**
Auto-configured, no changes needed.

**For Apache:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**For Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Problem: CSS/JS files return 404
**Solution:**
```javascript
// Check base path in vite.config.js
export default defineConfig({
  base: './', // Use relative paths
})
```

#### Problem: Build succeeds but deployment fails
**Solution:**
```bash
# Verify build locally:
npm run build
npm run preview
# Visit http://localhost:4173

# Check dist/ folder exists with files
ls -la dist/

# If preview works locally but fails in production:
# - Check Node version on server
# - Verify build command matches deployment
# - Check environment variables
```

---

### Getting Help

#### Check Logs
```bash
# Development
npm run dev
# Check console for red errors

# Production build
npm run build
# Check console for warnings

# Browser DevTools (F12)
# Console tab for errors
# Network tab for failed requests
```

#### Useful Commands
```bash
# Check npm version
npm --version

# List installed packages
npm list

# Update packages
npm update

# Audit for security
npm audit

# Clear all caches
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Files to Check
1. **package.json** - Dependencies and scripts
2. **vite.config.js** - Build configuration
3. **tailwind.config.js** - Tailwind settings
4. **index.html** - HTML template
5. **src/App.jsx** - Main app component
6. **src/main.jsx** - Entry point

#### Common File Locations
- Config: Root directory
- Components: `src/components/`
- Pages: `src/pages/`
- Data: `src/data/`
- Styles: `src/index.css`
- Build output: `dist/`

---

### Advanced Debugging

#### Enable Verbose Logging
```bash
# Vite debug mode
DEBUG=* npm run dev

# React DevTools (Chrome/Firefox extension)
# https://react-devtools-tutorial.vercel.app/
```

#### Check Node Modules
```bash
# Verify packages installed correctly
npm ls

# Check for duplicate packages
npm dedupe

# Audit dependencies
npm audit fix
```

#### Reset Everything
```bash
# Full clean install
rm -rf node_modules package-lock.json dist .next
npm cache clean --force
npm install
npm run build
```

---

### Still Having Issues?

1. **Check the README.md** for general info
2. **Check QUICK_START.md** for setup
3. **Check DEPLOYMENT.md** for deployment
4. **Check FEATURES.md** for feature status
5. **Review this file** for common solutions
6. **Check Vite docs**: https://vitejs.dev
7. **Check React docs**: https://react.dev
8. **Check Tailwind docs**: https://tailwindcss.com

### Getting More Help

- Check GitHub Issues for similar problems
- Review error messages carefully
- Clear cache and reinstall
- Try on different browser
- Isolate the problem to specific component
- Create minimal reproduction

---

**Most issues are solved by:**
1. `npm cache clean --force`
2. `rm -rf node_modules package-lock.json`
3. `npm install`
4. `npm run dev`

If problems persist, check the documentation files included in the project.
