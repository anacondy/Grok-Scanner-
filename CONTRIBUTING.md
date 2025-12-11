# Contributing to Cinematic Archives

Thank you for your interest in contributing to Cinematic Archives! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Grok-Scanner-.git
   cd Grok-Scanner-
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up your API key**:
   - Copy `.env.example` to `.env`
   - Add your xAI API key from https://x.ai/api
5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Making Changes

1. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards:
   - Use consistent formatting
   - Write clear, descriptive comments
   - Follow React best practices
   - Keep performance in mind (60+ FPS target)

3. **Test your changes**:
   - Test on multiple screen sizes
   - Test on different browsers
   - Verify 60+ FPS performance
   - Check mobile responsiveness

4. **Lint your code**:
   ```bash
   npm run lint
   ```

5. **Build to verify**:
   ```bash
   npm run build
   ```

### Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `perf:` for performance improvements
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub:
   - Provide a clear description
   - Reference any related issues
   - Add screenshots for UI changes
   - List tested platforms/browsers

## Coding Standards

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types or TypeScript
- Optimize for performance (memo, useCallback, useMemo)

### Styling
- Use Tailwind CSS utility classes
- Maintain the cyberpunk/dark theme aesthetic
- Ensure responsive design (mobile-first)
- Test on various screen sizes

### Performance
- Target 60+ FPS on all devices
- Support high refresh rates (90Hz, 120Hz, 144Hz)
- Optimize animations with GPU acceleration
- Minimize re-renders
- Use `will-change` sparingly

### API Integration
- Handle errors gracefully
- Implement proper loading states
- Show user-friendly error messages
- Respect rate limits

## Project Structure

```
Grok-Scanner-/
├── .github/
│   ├── workflows/       # CI/CD pipelines
│   └── ISSUE_TEMPLATE/  # Issue templates
├── src/
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
└── README.md           # Documentation
```

## Platform-Specific Guidelines

### Web (GitHub Pages)
- Ensure compatibility with modern browsers
- Test responsive design
- Optimize bundle size

### Android APK
- Test with Capacitor
- Verify permissions
- Test on various Android versions

### Desktop (Windows/Mac)
- Test with Electron
- Verify window behaviors
- Test with different screen DPI settings

## Testing

### Manual Testing Checklist
- [ ] Upload and scan various image types
- [ ] Test drag-and-drop functionality
- [ ] Verify animations are smooth (60+ FPS)
- [ ] Test on mobile devices
- [ ] Test error handling (invalid API key, network errors)
- [ ] Test deep scan feature
- [ ] Verify responsive design

### Performance Testing
- Use browser DevTools Performance tab
- Monitor frame rate during animations
- Check memory usage
- Test on low-end devices

## Getting Help

- **Questions?** Open a GitHub Discussion
- **Bug?** Create a Bug Report issue
- **Feature idea?** Create a Feature Request issue
- **Performance issue?** Create a Performance Issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be acknowledged in the project README and release notes.

Thank you for contributing! 🎬✨
