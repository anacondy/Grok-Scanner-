# Cinematic Archives - Wiki

Welcome to the Cinematic Archives Wiki! This comprehensive guide covers everything you need to know about using, deploying, and developing the application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Platform Guides](#platform-guides)
3. [Configuration](#configuration)
4. [Performance Optimization](#performance-optimization)
5. [API Integration](#api-integration)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Topics](#advanced-topics)

---

## Getting Started

### What is Cinematic Archives?

Cinematic Archives is an AI-powered web application that analyzes and identifies movie posters, game covers, and celebrity portraits using xAI's Grok vision API. It features a cyberpunk-themed interface with smooth animations optimized for 60+ FPS performance.

### Quick Start Guide

1. **Access the Web Version**: Visit [https://anacondy.github.io/Grok-Scanner-/](https://anacondy.github.io/Grok-Scanner-/)
2. **Upload an Image**: Drag and drop or click to upload a movie poster, game cover, or celebrity photo
3. **Initiate Scan**: Click the "INITIATE SCAN" button to analyze the image
4. **View Results**: See detailed information including title, year, genre, and description
5. **Deep Scan (Optional)**: Use "DEEP NETWORK SCAN" for sourced information with references

### System Requirements

#### Web Version
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Internet connection
- JavaScript enabled
- Minimum 2GB RAM recommended

#### Mobile Apps
- **Android**: Android 8.0 (Oreo) or higher, 2GB RAM
- **iOS**: iOS 13 or higher, 2GB RAM

#### Desktop Apps
- **Windows**: Windows 10 or higher, 4GB RAM
- **macOS**: macOS 10.15 (Catalina) or higher, 4GB RAM

---

## Platform Guides

### Web (GitHub Pages)

The web version is hosted on GitHub Pages and automatically deployed when changes are pushed to the main branch.

**Accessing**: [https://anacondy.github.io/Grok-Scanner-/](https://anacondy.github.io/Grok-Scanner-/)

**Features**:
- No installation required
- Automatic updates
- Cross-platform compatibility
- Works on any device with a modern browser

**Limitations**:
- Requires internet connection
- API key must be configured in the deployed environment

### Android APK

Download the latest Android APK from the [Releases page](https://github.com/anacondy/Grok-Scanner-/releases).

**Installation**:
1. Download the `.apk` file
2. Enable "Install from Unknown Sources" in your device settings
3. Open the APK file to install
4. Grant necessary permissions when prompted

**Features**:
- Native Android experience
- Offline UI (online for AI features)
- Optimized for mobile performance
- Supports all screen sizes and refresh rates

### iOS App

iOS builds require an Apple Developer account for distribution. Contact the maintainers for TestFlight access.

**Features**:
- Native iOS experience
- ProMotion display support (120Hz on compatible devices)
- Dark mode by default

### Windows Desktop

Download the Windows installer from the [Releases page](https://github.com/anacondy/Grok-Scanner-/releases).

**Installation**:
1. Download the `.exe` installer
2. Run the installer
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

**Features**:
- Native Windows application
- High-DPI display support
- 144Hz monitor support
- Keyboard shortcuts

### macOS Desktop

Download the macOS app from the [Releases page](https://github.com/anacondy/Grok-Scanner-/releases).

**Installation**:
1. Download the `.dmg` file
2. Open the DMG
3. Drag "Cinematic Archives" to Applications folder
4. Launch from Applications

**Features**:
- Native macOS experience
- Apple Silicon and Intel support
- ProMotion display support
- Touch Bar support (on compatible Macs)

---

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Required: xAI Grok API Key
VITE_XAI_API_KEY=your_api_key_here

# Optional: Grok Model Version (default: grok-beta)
VITE_GROK_MODEL=grok-beta

# Optional: Set to 'true' when building for GitHub Pages
VITE_GITHUB_PAGES=true
```

### Getting an API Key

1. Visit [https://x.ai/api](https://x.ai/api)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

**Important**: Never commit your `.env` file to version control. It's already in `.gitignore`.

### Customizing the Model

You can use different Grok models by setting `VITE_GROK_MODEL`:

- `grok-beta` (default) - Latest beta version with vision support
- Future models can be specified as they become available

### Repository Name Configuration

If you fork this repository or rename it, update the `REPO_NAME` constant in `vite.config.js`:

```javascript
const REPO_NAME = '/your-repo-name/'
```

---

## Performance Optimization

### Target Performance

Cinematic Archives is designed to run at **60+ FPS** on all devices, with support for high refresh rate displays:

- 60Hz: Standard displays
- 90Hz: Mid-range phones
- 120Hz: Flagship phones, modern laptops
- 144Hz: Gaming monitors

### How We Achieve 60+ FPS

1. **GPU Acceleration**: All animations use CSS transforms with `translateZ(0)` for hardware acceleration
2. **Optimized Particle System**: RequestAnimationFrame for smooth particle animations
3. **Code Splitting**: Vendor and icon chunks loaded separately
4. **Efficient Re-renders**: React.memo and useCallback prevent unnecessary updates
5. **Responsive Particle Count**: Fewer particles on mobile devices
6. **Minification**: Production builds are minified and tree-shaken

### Performance Monitoring

Use browser DevTools to monitor performance:

1. Open DevTools (F12)
2. Go to Performance tab
3. Record a session
4. Look for frame rates and bottlenecks

**Target Metrics**:
- Frame rate: 60 FPS minimum
- Paint time: < 16ms per frame
- Memory usage: < 100MB for web version

### Optimization Tips

For developers:

- Use `will-change` sparingly (only on actively animating elements)
- Avoid layout thrashing (read then write DOM)
- Use CSS containment for isolated components
- Debounce expensive operations
- Profile before and after changes

---

## API Integration

### xAI Grok API

Cinematic Archives uses the xAI Grok API for image analysis.

**Endpoint**: `https://api.x.ai/v1/chat/completions`

**Features Used**:
- Vision model for image analysis
- JSON response formatting
- Tool calling for deep search

### Request Format

```javascript
{
  "model": "grok-beta",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "Analyze this image..." },
        { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
      ]
    }
  ],
  "response_format": { "type": "json_object" },
  "temperature": 0.1,
  "max_tokens": 1024
}
```

### Response Format

```json
{
  "title": "Movie Title or Person Name",
  "year": "2023 or b. 1985",
  "genre": "Action, Thriller",
  "description": "Detailed description...",
  "is_person": false,
  "sources": [
    { "uri": "https://imdb.com/...", "title": "IMDb" }
  ]
}
```

### Error Handling

The application handles various API errors:

- **401 Unauthorized**: Invalid or expired API key
- **429 Rate Limited**: Too many requests, automatic retry with exponential backoff
- **503 Service Unavailable**: API temporarily down, automatic retry
- **Vision Errors**: Falls back to text-only analysis

### Rate Limits

xAI API rate limits vary by plan. The application includes retry logic with exponential backoff to handle rate limits gracefully.

---

## Troubleshooting

### Common Issues

#### API Key Not Working

**Symptoms**: "SECURITY_CLEARANCE_FAILED" error message

**Solutions**:
1. Verify your API key is correct in `.env`
2. Check if your API key is active at [x.ai/api](https://x.ai/api)
3. Ensure `.env` file is in the project root
4. Restart the development server after changing `.env`

#### Build Fails

**Symptoms**: Build errors during `npm run build`

**Solutions**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Clear build cache: `rm -rf dist`
4. Ensure all dependencies are installed
5. Check Node.js version (requires 18+)

#### Performance Issues

**Symptoms**: Low frame rate, stuttering animations

**Solutions**:
1. Check if hardware acceleration is enabled in your browser
2. Close other tabs/applications
3. Update graphics drivers
4. Disable browser extensions
5. Use Chrome or Edge for best performance

#### Image Not Recognized

**Symptoms**: "DATA_RESTRICTED" or unclear results

**Solutions**:
1. Use clear, high-quality images
2. Try "DEEP NETWORK SCAN" for better results
3. Ensure the image is a movie poster, game cover, or recognizable celebrity
4. Avoid heavily edited or filtered images
5. Check if the API is working (try another image)

### Debug Mode

Enable debug logging in the browser console:

1. Open DevTools (F12)
2. Go to Console tab
3. Look for analysis errors or API responses
4. Check Network tab for failed requests

### Getting Help

If you're still stuck:

1. Check [existing issues](https://github.com/anacondy/Grok-Scanner-/issues)
2. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Screenshots/videos
   - Browser/device information
   - Console logs (if applicable)

---

## Advanced Topics

### Local Development

```bash
# Clone the repository
git clone https://github.com/anacondy/Grok-Scanner-.git
cd Grok-Scanner-

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your API key

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Custom Deployment

#### Deploy to Vercel

1. Fork the repository
2. Sign up at [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add `VITE_XAI_API_KEY` to environment variables
5. Deploy!

#### Deploy to Netlify

1. Fork the repository
2. Sign up at [netlify.com](https://netlify.com)
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add `VITE_XAI_API_KEY` to environment variables
7. Deploy!

### Building Native Apps

#### Android APK (Manual)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
npx cap init "Cinematic Archives" "com.cinematicarchives.app" --web-dir=dist

# Build web assets
npm run build

# Add Android platform
npx cap add android
npx cap sync android

# Open in Android Studio
npx cap open android

# Or build from command line
cd android
./gradlew assembleDebug
```

#### Windows EXE (Manual)

```bash
# Install Electron
npm install --save-dev electron electron-builder

# Create electron.js (see build-desktop.yml for code)

# Build web assets
npm run build

# Build Windows executable
npx electron-builder --win
```

#### macOS DMG (Manual)

```bash
# Install Electron
npm install --save-dev electron electron-builder

# Create electron.js (see build-desktop.yml for code)

# Build web assets
npm run build

# Build macOS app
npx electron-builder --mac
```

### CI/CD Customization

#### Adding Tests

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Add test script to package.json
"test": "vitest"

# Create test files
# src/App.test.jsx
```

Update `.github/workflows/ci.yml` to run tests:

```yaml
- name: Run Tests
  run: npm test
```

#### Custom Build Triggers

Modify workflow files in `.github/workflows/` to trigger on different events:

- Push to specific branches
- Pull request creation
- Manual workflow dispatch
- Scheduled runs (cron)

### Extending Functionality

#### Adding New AI Providers

1. Create a new API client in `src/api/`
2. Add provider selection in UI
3. Update environment variables
4. Handle different response formats

#### Custom Themes

1. Modify Tailwind config in `tailwind.config.js`
2. Update color schemes in `src/index.css`
3. Adjust animations in `src/App.jsx`

#### Multi-Language Support

1. Install i18n library: `npm install react-i18next`
2. Create translation files
3. Wrap UI text in translation functions
4. Add language selector

---

## Additional Resources

### Documentation Links

- [xAI API Documentation](https://docs.x.ai/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Capacitor Documentation](https://capacitorjs.com/)
- [Electron Documentation](https://www.electronjs.org/)

### Community

- [GitHub Discussions](https://github.com/anacondy/Grok-Scanner-/discussions)
- [Issue Tracker](https://github.com/anacondy/Grok-Scanner-/issues)
- [Contributing Guide](CONTRIBUTING.md)

### License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintained by**: ANACONDY & GROKY
