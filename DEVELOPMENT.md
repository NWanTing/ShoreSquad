# ShoreSquad Development Guide

## Quick Start with Live Server

### Prerequisites
1. **VS Code** with the Live Server extension installed
2. **Modern browser** (Chrome, Firefox, Safari, Edge)

### Running the Development Server

**Method 1: Using Live Server Extension**
1. Open the project folder in VS Code
2. Right-click on `index.html` in the Explorer
3. Select "Open with Live Server"
4. The website will open at `http://localhost:3000` (or `http://127.0.0.1:5500`)

**Method 2: Using VS Code Command Palette**
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "Live Server: Open with Live Server"
3. Press Enter

**Method 3: Using the Status Bar**
1. Look for "Go Live" in the bottom status bar of VS Code
2. Click on it to start the server

### Features Available in Development

✅ **Interactive Navigation**
- Mobile-responsive hamburger menu
- Smooth scrolling to sections
- Active link highlighting

✅ **Weather Widget**
- Mock weather data display
- Responsive weather cards
- Beach condition recommendations

✅ **Interactive Map**
- Location and date filtering
- Mock cleanup event discovery
- Event participation features

✅ **Crew Management**
- Mock crew dashboard
- Activity feed
- Social features

✅ **Performance Optimizations**
- Debounced search inputs
- Throttled scroll events
- Lazy loading animations

### Testing Different Devices

**Desktop Testing:**
- Resize your browser window to test responsiveness
- Test at common breakpoints: 1920px, 1440px, 1024px

**Mobile Testing:**
1. Open Developer Tools (`F12`)
2. Click the device toolbar icon
3. Select different device presets
4. Test touch interactions and mobile navigation

**Accessibility Testing:**
- Use Tab key to navigate through interactive elements
- Test with screen reader if available
- Check color contrast in different lighting

### Browser Compatibility

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Progressive Enhancement:**
- Core functionality works without JavaScript
- Enhanced features require modern browser support
- Graceful degradation for older browsers

### Development Tips

**Live Reload:**
- Any changes to HTML, CSS, or JS files will automatically reload the page
- If live reload doesn't work, check the Live Server extension settings

**Debugging:**
- Open Developer Tools (`F12`) to see console messages
- Check the Network tab for failed resource loads
- Use the Elements tab to inspect styling

**Performance Monitoring:**
- Check the Console for performance metrics
- Use Lighthouse in DevTools for comprehensive analysis
- Monitor Core Web Vitals in the Performance tab

### File Structure Explanation

```
ShoreSquad/
├── index.html              # Main entry point
├── css/styles.css          # All styling (responsive, modern)
├── js/app.js              # Interactive functionality
├── .vscode/settings.json   # Live Server configuration
├── site.webmanifest       # PWA manifest
├── sw.js                  # Service Worker (PWA)
├── package.json           # Project metadata
├── README.md              # Project documentation
└── .gitignore             # Git ignore rules
```

### Next Steps for Development

1. **Real API Integration:**
   - Replace mock weather data with OpenWeatherMap API
   - Integrate Google Maps or Mapbox for real locations

2. **Backend Development:**
   - User authentication system
   - Crew management database
   - Event creation and management

3. **Enhanced Features:**
   - Push notifications
   - Social sharing
   - Offline functionality

### Troubleshooting

**Common Issues:**

**Live Server not working:**
- Ensure Live Server extension is installed and enabled
- Try restarting VS Code
- Check for port conflicts (default is 5500)

**Styles not loading:**
- Check file paths in HTML
- Ensure CSS file is saved
- Clear browser cache (`Ctrl+F5`)

**JavaScript errors:**
- Open Developer Tools Console
- Check for syntax errors
- Ensure all HTML elements exist before JS tries to access them

**Mobile view issues:**
- Add viewport meta tag (already included)
- Test actual mobile devices, not just DevTools simulation
- Check touch event handling

### Performance Optimization

**Current Optimizations:**
- CSS Grid and Flexbox for efficient layouts
- Debounced user inputs
- Throttled scroll events
- Intersection Observer for animations
- Optimized images and fonts

**Future Optimizations:**
- Image compression and WebP format
- Code splitting for JavaScript
- Critical CSS inlining
- Service Worker caching strategy

---

Happy coding! 🌊 Let's make beach cleanups awesome! 🏖️
