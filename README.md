# 🎬 Cinematic Archives - AI Movie Poster Scanner

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-GitHub_Pages-9333ea?style=for-the-badge)](https://anacondy.github.io/Grok-Scanner-/)
[![CI Status](https://img.shields.io/github/actions/workflow/status/anacondy/Grok-Scanner-/ci.yml?branch=main&label=Build&style=for-the-badge)](https://github.com/anacondy/Grok-Scanner-/actions)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **🚀 Experience it live:** [https://anacondy.github.io/Grok-Scanner-/](https://anacondy.github.io/Grok-Scanner-/)

A sleek, cyberpunk-themed React web application that uses AI to scan and identify movie posters, game covers, and celebrity portraits. Powered by xAI's Grok API for accurate, uncensored media identification.

![Cinematic Archives Banner](https://img.shields.io/badge/Status-Ready_to_Scan-9333ea?style=flat-square)
![Performance](https://img.shields.io/badge/Performance-60+_FPS-00ff00?style=flat-square)
![Platforms](https://img.shields.io/badge/Platforms-Web_|_Android_|_iOS_|_Windows_|_Mac-blue?style=flat-square)

---

## ✨ Features

### 🎯 Core Features
- **🖼️ Drag & Drop Upload**: Effortlessly upload movie posters, game covers, or celebrity photos
- **🤖 AI-Powered Scanning**: Advanced image analysis using xAI's Grok vision model
- **🔍 Deep Network Scan**: Optional grounding mode for sourced facts with web search emulation
- **⚡ Real-time Analysis**: Fast identification of titles, release years, genres, cast, and directors
- **🎨 Cyberpunk UI**: Immersive dark theme with neon accents, scan lines, and particle effects
- **📱 Fully Responsive**: Seamless experience on desktop, tablet, and mobile devices
- **🎭 Uncensored Content**: Handles adult industry content factually without censorship blocks

### 🚀 Performance Features
- **⚡ 60+ FPS**: Smooth animations on all devices, including low-end hardware
- **🖥️ High Refresh Rate Support**: Automatically adapts to 90Hz, 120Hz, and 144Hz displays
- **🎮 GPU Acceleration**: Hardware-accelerated animations for buttery-smooth performance
- **📊 Optimized Rendering**: Efficient particle system and minimal re-renders
- **🔋 Battery Friendly**: Optimized for mobile devices

### 🎨 Visual Features
- **✨ Animated Scanning Effects**: Glowing borders, scan lines, and pulsing effects
- **🌌 Dynamic Background**: Ambient particle system with cyberpunk aesthetic
- **🎭 Status Indicators**: Visual feedback for scanning, results, and errors
- **🌈 Color-Coded States**: Green for scanning, purple for results, amber for deep scans
- **📸 Result Previews**: Beautiful presentation of analyzed media information

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **xAI API Key** from [x.ai/api](https://x.ai/api) (free tier available)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anacondy/Grok-Scanner-.git
   cd Grok-Scanner-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your API key**:
   ```bash
   cp .env.example .env
   # Edit .env and add your xAI API key:
   # VITE_XAI_API_KEY=your_actual_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

5. **Build for production**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 📦 Available Platforms

### 🌐 Web (GitHub Pages)
**Live Demo**: [https://anacondy.github.io/Grok-Scanner-/](https://anacondy.github.io/Grok-Scanner-/)
- Instant access, no installation required
- Works on all modern browsers
- Automatic updates via CI/CD

### 📱 Android APK
Download the latest Android build from [Releases](https://github.com/anacondy/Grok-Scanner-/releases)
- Native Android experience
- Optimized for mobile performance
- Supports all screen sizes and refresh rates

### 🍎 iOS (Coming Soon)
iOS build requires Apple Developer account for distribution

### 🪟 Windows Desktop
Download the Windows installer from [Releases](https://github.com/anacondy/Grok-Scanner-/releases)
- Native Windows application
- Supports high-DPI displays
- 144Hz monitor support

### 🍏 macOS Desktop
Download the macOS app from [Releases](https://github.com/anacondy/Grok-Scanner-/releases)
- Native macOS experience
- Apple Silicon and Intel support
- ProMotion display support

---

## 🎮 How to Use

1. **Open the app** (web or desktop)
2. **Drag and drop** an image or click to upload
3. **Click "INITIATE SCAN"** to analyze the image
4. **View results** including title, year, genre, and description
5. **Use "DEEP NETWORK SCAN"** for sourced information with references

### Pro Tips
- Works best with clear, high-quality images
- Supports multiple uploads simultaneously
- Deep scan provides additional context and sources
- No image data is stored - privacy first!

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Modern UI library with hooks
- **Vite 5** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### AI & API
- **xAI Grok API** - Advanced vision and language model
- **Fetch API** - Modern HTTP client
- **JSON parsing** - Structured data extraction

### Build & Deploy
- **GitHub Actions** - Automated CI/CD pipelines
- **GitHub Pages** - Free web hosting
- **Capacitor** - Cross-platform mobile builds
- **Electron** - Desktop application framework

---

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code with ESLint
```

### Project Structure

```
Grok-Scanner-/
├── .github/
│   ├── workflows/           # CI/CD pipelines
│   │   ├── ci.yml          # Continuous Integration
│   │   ├── deploy-pages.yml # GitHub Pages deployment
│   │   ├── build-android.yml # Android APK builds
│   │   └── build-desktop.yml # Windows/Mac builds
│   └── ISSUE_TEMPLATE/      # Bug & feature templates
├── src/
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles & animations
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── README.md               # This file
```

### Performance Optimizations

The app is optimized for **60+ FPS** performance:

1. **GPU Acceleration**: CSS transforms use `translateZ(0)` for hardware acceleration
2. **Efficient Animations**: RequestAnimationFrame for smooth particle system
3. **Optimized Re-renders**: React.memo and useCallback to prevent unnecessary updates
4. **Code Splitting**: Vendor and icon chunks loaded separately
5. **Minification**: Production builds are minified and tree-shaken
6. **Responsive Particle Count**: Fewer particles on mobile devices

### High Refresh Rate Support

The app automatically detects and supports:
- 60Hz displays (standard)
- 90Hz displays (common on mid-range phones)
- 120Hz displays (flagship phones, modern laptops)
- 144Hz displays (gaming monitors)

CSS animations use `will-change` and hardware acceleration to maintain smooth frame rates.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- 🐛 Report bugs via [Bug Report](https://github.com/anacondy/Grok-Scanner-/issues/new?template=bug_report.md)
- 💡 Suggest features via [Feature Request](https://github.com/anacondy/Grok-Scanner-/issues/new?template=feature_request.md)
- ⚡ Report performance issues via [Performance Issue](https://github.com/anacondy/Grok-Scanner-/issues/new?template=performance_issue.md)
- 🔧 Submit pull requests with improvements
- 📖 Improve documentation

---

## 🔐 Security & Privacy

- **No Data Storage**: Images are processed in real-time and not stored
- **Client-Side Only**: All processing happens in your browser/app
- **API Key Security**: Store your xAI API key in `.env` (never committed to git)
- **HTTPS Only**: Production builds use secure connections
- **No Telemetry**: We don't track usage or collect analytics

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Free to use, modify, and distribute. Attribution appreciated but not required.

---

## 🙏 Acknowledgments

- **Built with ❤️** by ANACONDY & GROKY
- **Powered by** xAI Grok API
- **Inspired by** cyberpunk aesthetics and film archives
- **Icons by** Lucide React
- **UI Framework** by Tailwind CSS

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/anacondy/Grok-Scanner-/issues)
- **Discussions**: [GitHub Discussions](https://github.com/anacondy/Grok-Scanner-/discussions)
- **Email**: Open an issue for direct support

---

## 🗺️ Roadmap

- [x] Core AI scanning functionality
- [x] GitHub Pages deployment
- [x] CI/CD pipelines
- [x] Android APK builds
- [x] Windows desktop app
- [x] macOS desktop app
- [ ] iOS build (requires Apple Developer account)
- [ ] Multi-language support
- [ ] Batch processing
- [ ] Export results (JSON, CSV)
- [ ] Custom API provider support
- [ ] Offline mode with cached models

---

## 📊 Status

![GitHub last commit](https://img.shields.io/github/last-commit/anacondy/Grok-Scanner-?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/anacondy/Grok-Scanner-?style=flat-square)
![GitHub pull requests](https://img.shields.io/github/issues-pr/anacondy/Grok-Scanner-?style=flat-square)

**Current Version**: 1.0.0  
**Status**: 🟢 Active Development  
**Performance**: ⚡ 60+ FPS on all platforms

---

<div align="center">

**[🌐 Try it now!](https://anacondy.github.io/Grok-Scanner-/)** • **[📱 Download Apps](https://github.com/anacondy/Grok-Scanner-/releases)** • **[📖 Documentation](PROJECT.md)**

Made with 🎬 and AI

</div>