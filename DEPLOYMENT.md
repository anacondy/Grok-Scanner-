# Deployment Guide for Cinematic Archives

This document provides detailed instructions for deploying Cinematic Archives across all supported platforms.

## Quick Links

- **Live Demo**: [https://anacondy.github.io/Grok-Scanner-/](https://anacondy.github.io/Grok-Scanner-/)
- **Repository**: [https://github.com/anacondy/Grok-Scanner-](https://github.com/anacondy/Grok-Scanner-)
- **Releases**: [https://github.com/anacondy/Grok-Scanner-/releases](https://github.com/anacondy/Grok-Scanner-/releases)

---

## Table of Contents

1. [GitHub Pages (Web)](#github-pages-web)
2. [Android APK](#android-apk)
3. [iOS App](#ios-app)
4. [Windows Desktop](#windows-desktop)
5. [macOS Desktop](#macos-desktop)
6. [Third-Party Platforms](#third-party-platforms)

---

## GitHub Pages (Web)

### Automatic Deployment

The web version is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

**Workflow**: `.github/workflows/deploy-pages.yml`

### Setup Steps

1. **Enable GitHub Pages**:
   - Go to repository Settings > Pages
   - Source: GitHub Actions
   - No custom domain needed

2. **Add API Key Secret**:
   - Go to repository Settings > Secrets and variables > Actions
   - Add `VITE_XAI_API_KEY` with your xAI API key
   - This is used during build time only

3. **Trigger Deployment**:
   - Push to `main` branch: `git push origin main`
   - Or manually trigger from Actions tab

4. **Access the Site**:
   - URL: `https://anacondy.github.io/Grok-Scanner-/`
   - Usually live within 2-3 minutes

### Manual Deployment

If you need to deploy manually:

```bash
# Build with GitHub Pages base path
VITE_GITHUB_PAGES=true npm run build

# The dist/ folder is ready to deploy
# Upload to any static hosting service
```

### Custom Domain (Optional)

To use a custom domain:

1. Add `CNAME` file to `public/` folder with your domain
2. Update DNS records to point to GitHub Pages
3. Enable HTTPS in repository settings

---

## Android APK

### Automatic Build

Android APKs are built automatically when you create a release tag.

**Workflow**: `.github/workflows/build-android.yml`

### Create a Release

```bash
# Tag a new version
git tag v1.0.0

# Push the tag
git push origin v1.0.0

# GitHub Actions will build and attach APK to release
```

### Manual Build

For local Android builds:

```bash
# 1. Install dependencies
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Build web assets
npm run build

# 3. Initialize Capacitor (first time only)
npx cap init "Cinematic Archives" "com.cinematicarchives.app" --web-dir=dist

# 4. Add Android platform
npx cap add android

# 5. Sync web assets
npx cap sync android

# 6. Build APK
cd android
chmod +x ./gradlew
./gradlew assembleDebug

# 7. Find APK at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Signing for Release

To create a signed release APK:

1. **Generate Keystore**:
```bash
keytool -genkey -v -keystore cinematic-archives.keystore -alias cinematic -keyalg RSA -keysize 2048 -validity 10000
```

2. **Add to GitHub Secrets**:
   - `ANDROID_KEYSTORE` (base64 encoded keystore)
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`

3. **Update Workflow**:
   - Modify `build-android.yml` to use `assembleRelease`
   - Add signing configuration

### Distribution

- Upload APK to GitHub Releases
- Submit to Google Play Store (requires developer account)
- Distribute via Firebase App Distribution
- Self-host on your website

---

## iOS App

### Requirements

- macOS with Xcode installed
- Apple Developer account ($99/year)
- iOS development certificate

### Manual Build

```bash
# 1. Install dependencies
npm install
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 2. Build web assets
npm run build

# 3. Initialize Capacitor (first time only)
npx cap init "Cinematic Archives" "com.cinematicarchives.app" --web-dir=dist

# 4. Add iOS platform
npx cap add ios

# 5. Sync web assets
npx cap sync ios

# 6. Open in Xcode
npx cap open ios

# 7. In Xcode:
#    - Set development team
#    - Configure signing
#    - Archive and export IPA
```

### Automated Build (GitHub Actions)

To add iOS builds to GitHub Actions:

1. Add macOS runner workflow (similar to Android)
2. Configure code signing with GitHub Secrets:
   - `IOS_CERTIFICATE_BASE64`
   - `IOS_CERTIFICATE_PASSWORD`
   - `IOS_PROVISIONING_PROFILE_BASE64`
3. Use `xcodebuild` or Fastlane for automation

### Distribution

- TestFlight (beta testing)
- App Store (public release)
- Ad-hoc distribution (limited devices)
- Enterprise distribution (requires enterprise account)

---

## Windows Desktop

### Automatic Build

Windows executables are built automatically on release tags.

**Workflow**: `.github/workflows/build-desktop.yml`

### Create a Release

```bash
# Tag a new version
git tag v1.0.0

# Push the tag
git push origin v1.0.0

# GitHub Actions will build and attach EXE to release
```

### Manual Build

For local Windows builds:

```bash
# 1. Install dependencies
npm install
npm install --save-dev electron electron-builder

# 2. Create electron.js (see workflow for code)
# Copy the electron.js code from build-desktop.yml

# 3. Build web assets
npm run build

# 4. Update package.json
# Add "main": "electron.js"
# Add "build" configuration (see workflow)

# 5. Build Windows executable
npx electron-builder --win --x64

# 6. Find EXE at:
# release/*.exe
```

### Signing (Optional)

To sign Windows executables:

1. Obtain code signing certificate
2. Add to GitHub Secrets:
   - `WINDOWS_CERTIFICATE_BASE64`
   - `WINDOWS_CERTIFICATE_PASSWORD`
3. Update workflow to sign during build

### Distribution

- Upload to GitHub Releases
- Submit to Microsoft Store
- Create installer with NSIS or Inno Setup
- Self-host on your website

---

## macOS Desktop

### Automatic Build

macOS apps are built automatically on release tags.

**Workflow**: `.github/workflows/build-desktop.yml`

### Create a Release

```bash
# Tag a new version
git tag v1.0.0

# Push the tag
git push origin v1.0.0

# GitHub Actions will build and attach DMG to release
```

### Manual Build

For local macOS builds:

```bash
# 1. Install dependencies
npm install
npm install --save-dev electron electron-builder

# 2. Create electron.js (see workflow for code)
# Copy the electron.js code from build-desktop.yml

# 3. Build web assets
npm run build

# 4. Update package.json
# Add "main": "electron.js"
# Add "build" configuration (see workflow)

# 5. Build macOS app
npx electron-builder --mac --x64 --arm64

# 6. Find DMG at:
# release/*.dmg
```

### Code Signing

To sign macOS apps (required for distribution):

1. Enroll in Apple Developer Program
2. Create Developer ID certificate
3. Add to GitHub Secrets:
   - `MACOS_CERTIFICATE_BASE64`
   - `MACOS_CERTIFICATE_PASSWORD`
4. Update workflow to sign and notarize

### Distribution

- Upload to GitHub Releases
- Submit to Mac App Store
- Notarize for Gatekeeper
- Self-host with signed DMG

---

## Third-Party Platforms

### Vercel

1. Import GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_XAI_API_KEY`
5. Deploy!

**URL**: `your-project.vercel.app`

### Netlify

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_XAI_API_KEY`
5. Deploy!

**URL**: `your-project.netlify.app`

### Cloudflare Pages

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set build output: `dist`
4. Add environment variable: `VITE_XAI_API_KEY`
5. Deploy!

**URL**: `your-project.pages.dev`

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build project
npm run build

# Deploy
firebase deploy
```

---

## Environment Variables

### Required

- `VITE_XAI_API_KEY`: Your xAI Grok API key (get from https://x.ai/api)

### Optional

- `VITE_GROK_MODEL`: Grok model version (default: `grok-beta`)
- `VITE_GITHUB_PAGES`: Set to `true` for GitHub Pages builds

### Setting in CI/CD

For GitHub Actions, add secrets in repository settings:
- Settings > Secrets and variables > Actions
- Add each secret with appropriate access

For other platforms:
- Add in deployment settings
- Usually found under "Environment Variables" or "Build Settings"

---

## Performance Checklist

Before deploying, ensure:

- [x] Build is optimized (`npm run build`)
- [x] Assets are minified
- [x] Code splitting is enabled
- [x] Images are optimized
- [x] API keys are in secrets (not hardcoded)
- [x] Error handling is in place
- [x] HTTPS is enabled
- [x] CSP headers are configured (if needed)

---

## Monitoring

### Web Analytics (Optional)

Add analytics to track usage:

```javascript
// In src/main.jsx or src/App.jsx
// Google Analytics, Plausible, or similar
```

### Error Tracking (Optional)

Add error tracking:

```bash
npm install @sentry/react
```

### Performance Monitoring

Use browser DevTools or:
- Lighthouse CI
- Web Vitals
- Performance API

---

## Troubleshooting

### Build Fails

- Check Node.js version (requires 18+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check for missing dependencies
- Verify environment variables

### Deployment Fails

- Check GitHub Actions logs
- Verify secrets are set correctly
- Ensure workflows have proper permissions
- Check for rate limits or quota issues

### App Not Working

- Verify API key is set
- Check browser console for errors
- Test in different browsers
- Clear browser cache

---

## Security Best Practices

1. **Never commit secrets**: Use `.gitignore` for `.env`
2. **Use GitHub Secrets**: For CI/CD environment variables
3. **Enable HTTPS**: Always use secure connections
4. **Regular updates**: Keep dependencies up to date
5. **Code scanning**: Enable GitHub Advanced Security
6. **Access control**: Limit repository access
7. **Sign releases**: Use code signing for native apps

---

## Support

For deployment issues:

1. Check [Issues](https://github.com/anacondy/Grok-Scanner-/issues)
2. Review [Wiki](WIKI.md)
3. Check [Discussions](https://github.com/anacondy/Grok-Scanner-/discussions)
4. Contact maintainers

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintained by**: ANACONDY & GROKY
