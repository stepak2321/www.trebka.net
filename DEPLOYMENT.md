# Deployment Checklist for trebka.net

## Pre-Deployment

### Update Configuration
- [ ] Update domain in index.html meta tags (og:url, twitter:image, canonical)
- [ ] Update sitemap.xml with your actual domain
- [ ] Update robots.txt with your domain
- [ ] Set correct lastmod date in sitemap.xml

### Test Locally
- [ ] Open index.html in Chrome/Edge
- [ ] Open index.html in Firefox
- [ ] Open index.html in Safari
- [ ] Test on mobile device (or use browser dev tools)
- [ ] Check browser console for errors (F12)
- [ ] Test all terminal commands (type 'help' to see list)
- [ ] Test keyboard shortcuts (see commands section)
- [ ] Test easter eggs (image clicks, title clicks, konami code)
- [ ] Verify all animations work smoothly

### Accessibility Check
- [ ] Navigate using only keyboard (Tab, Enter, Arrow keys)
- [ ] Test with screen reader (if available)
- [ ] Check color contrast
- [ ] Verify all images have alt text
- [ ] Check ARIA labels are present

### Performance Check
- [ ] Images load properly
- [ ] External fonts load correctly
- [ ] Audio files are accessible (check console)
- [ ] Canvas animations run smoothly (no lag)
- [ ] Page loads quickly

## Deployment Steps

### Upload Files
- [ ] Upload index.html
- [ ] Upload styles.css
- [ ] Upload script.js
- [ ] Upload favicon.svg
- [ ] Upload robots.txt
- [ ] Upload sitemap.xml
- [ ] Upload .htaccess (if using Apache)

### Server Configuration
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure compression (gzip/brotli)
- [ ] Set up caching headers
- [ ] Configure security headers
- [ ] Set up 404 error page redirect

### DNS & Domain
- [ ] Configure DNS A record to point to server
- [ ] Wait for DNS propagation (can take 24-48 hours)
- [ ] Verify domain resolves correctly

## Post-Deployment

### Verification
- [ ] Visit https://www.trebka.net in browser
- [ ] Check HTTPS is working (green padlock)
- [ ] Test on multiple devices
- [ ] Test on multiple browsers
- [ ] Verify terminal commands work
- [ ] Check mobile responsiveness
- [ ] Test loading speed

### SEO & Analytics
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify robots.txt is accessible (yoursite.com/robots.txt)
- [ ] Add analytics tracking (optional)
- [ ] Set up monitoring/uptime alerts

### Security
- [ ] Test security headers (use securityheaders.com)
- [ ] Verify HTTPS redirect works
- [ ] Check for mixed content warnings
- [ ] Test XSS protection

### Performance Testing
- [ ] Run Google PageSpeed Insights
- [ ] Run GTmetrix test
- [ ] Check WebPageTest results
- [ ] Optimize based on recommendations

## Optional Enhancements

### Advanced Features
- [ ] Add service worker for offline support
- [ ] Set up CDN (Cloudflare, etc.)
- [ ] Add analytics (Google Analytics, Plausible, etc.)
- [ ] Configure email for contact form (if added)
- [ ] Set up automated backups

### Marketing
- [ ] Create social media preview images
- [ ] Share on social media
- [ ] Submit to web directories
- [ ] Create og:image custom graphic

## Maintenance

### Regular Tasks
- [ ] Monitor uptime
- [ ] Check analytics
- [ ] Update content periodically
- [ ] Review and fix any reported issues
- [ ] Keep dependencies updated

---

## Quick Reference

### Important URLs to Test
- https://www.trebka.net
- https://www.trebka.net/robots.txt
- https://www.trebka.net/sitemap.xml

### Testing Tools
- Google PageSpeed Insights: https://pagespeed.web.dev/
- Security Headers: https://securityheaders.com/
- W3C Validator: https://validator.w3.org/
- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly

### Browser Testing
- Chrome DevTools (F12)
- Firefox Developer Tools (F12)
- Safari Web Inspector
- Mobile device testing

---

**Notes:**
- Always test in incognito/private mode to avoid caching issues
- Keep backup of all files before deploying updates
- Test HTTPS redirect before enforcing it
- Monitor initial traffic for any errors

Good luck with your deployment! 🚀
