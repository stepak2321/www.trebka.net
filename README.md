# trebka.net - Cyberpunk Interactive Experience

An interactive cyberpunk-themed website with terminal commands, easter eggs, and dynamic animations.

## Features

- **Interactive Terminal**: Type commands directly on the page
- **Canvas Animations**: Dynamic particle effects and matrix rain
- **Easter Eggs**: Multiple hidden secrets and achievements
- **Responsive Design**: Works on all devices
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Performance Optimized**: Lazy loading, debounced events, and efficient rendering

## Deployment Instructions

### Prerequisites
- Web server (Apache, Nginx, or any static hosting)
- HTTPS certificate (recommended for production)

### Quick Deploy

1. **Upload all files** to your web server's public directory:
   - index.html
   - styles.css
   - script.js
   - favicon.svg
   - robots.txt
   - sitemap.xml
   - .htaccess (for Apache servers)

2. **Update domain references** in:
   - index.html (meta tags)
   - robots.txt (sitemap URL)
   - sitemap.xml (loc URL)
   - .htaccess (if using HTTPS redirect)

3. **Enable HTTPS** (highly recommended):
   - Uncomment the HTTPS redirect in .htaccess
   - Or configure in your web server settings

### For Different Hosting Platforms

#### Apache Server
- Use the provided .htaccess file
- Ensure mod_headers, mod_deflate, and mod_expires are enabled

#### Nginx
Create an nginx.conf with similar headers:
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
gzip on;
gzip_types text/css application/javascript image/svg+xml;
```

#### Static Hosting (Netlify, Vercel, GitHub Pages)
- Simply upload the files
- No .htaccess needed
- Configure redirects in platform settings

### Browser Compatibility

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers

### Performance Tips

1. Enable server-side compression (gzip/brotli)
2. Use CDN for faster global delivery
3. Enable browser caching (via .htaccess or headers)
4. Consider adding a service worker for offline support

### Security

- All user inputs are sanitized
- No eval() usage (safe calculation parser)
- XSS protection headers enabled
- localStorage error handling

### Customization

#### Change Colors
Edit the CSS variables or search for `#7dff9b` (primary green) in styles.css

#### Add Commands
Add new cases in the `executeTerminalCommand()` function in script.js

#### Modify Canvas
Edit the `updateCanvas()` function in script.js

### Analytics (Optional)

Add your analytics tracking code before the closing `</body>` tag in index.html

### Testing

Before publishing:
1. ✅ Test on multiple browsers
2. ✅ Test on mobile devices
3. ✅ Verify all meta tags are updated
4. ✅ Check console for errors
5. ✅ Test keyboard navigation
6. ✅ Validate HTML/CSS
7. ✅ Check loading speed

### Support

For issues or questions, check browser console for errors.

### License

© 2026 trebka.net - All rights reserved

---

**Have fun exploring the site! Try typing 'help' in the terminal to get started.**
