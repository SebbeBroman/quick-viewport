# Quick Viewport

A Chrome extension for responsive design testing that allows you to quickly view and resize web pages to different viewport sizes. Built with SolidJS, TypeScript, and Vite.

## Features

- **One-Click Preview**: Click the extension icon to instantly open the current page in a resizable popup window
- **Custom Viewport Presets**: Create and manage custom viewport presets for different devices (iPhone, iPad, desktop, etc.)
- **Keyboard Shortcuts**: Use `Cmd/Ctrl + 1-9` to instantly resize windows to your saved presets
- **Real-Time Dimension Overlay**: See viewport dimensions displayed as you resize windows
- **Drag-and-Drop Reordering**: Organize your presets in any order via drag-and-drop
- **Auto-fill Device Templates**: Quick selection of common device sizes (iPhone 15 Pro, iPad Air, MacBook Pro, etc.)
- **Customizable Settings**: Configure overlay timeout and manage unlimited viewport presets

## Installation

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` directory from the project

### Production Build

Build the extension for distribution:

```bash
npm run build
```

The built extension will be in the `dist` directory and a packaged `.zip` file will be created in the `release` directory.

## Usage

### Opening a Viewport Window

1. Navigate to any webpage
2. Click the Quick Viewport extension icon in your toolbar
3. The page will open in a new popup window with the first preset size (or default mobile size)

### Managing Presets

1. Right-click the extension icon and select "Options" (or navigate to the settings page)
2. Add custom presets:
   - Click "+ Add Preset"
   - Choose from common device templates or enter custom dimensions
   - Enter a name, width, and height
   - Click "Add"
3. Edit or remove existing presets using the Edit/Remove buttons
4. Reorder presets by dragging them (the first 9 presets can be accessed via keyboard shortcuts)

### Keyboard Shortcuts

When a viewport window is open, use these shortcuts to quickly resize:

- `Cmd + 1` (or `Ctrl + 1` on Windows/Linux): Resize to first preset
- `Cmd + 2`: Resize to second preset
- `Cmd + 3-9`: Resize to respective presets

### Dimension Overlay

- Automatically appears when resizing a viewport window
- Shows current viewport dimensions (width × height)
- Displays preset name when using keyboard shortcuts
- Timeout is customizable in settings (default: 500ms)

## Project Structure

```
src/
├── background/
│   └── service-worker.ts      # Background script handling window creation and shortcuts
├── options/
│   ├── App.tsx                # Settings/options page UI
│   └── index.html             # Settings page entry
├── utils/
│   ├── device-presets.ts      # Common device viewport presets
│   ├── dimension-overlay-injector.ts  # Injects overlay into popup windows
│   └── settings.ts            # Settings storage management
└── manifest.config.ts         # Chrome extension manifest configuration
```

## Tech Stack

- **SolidJS**: Reactive UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **CRXJS**: Vite plugin for Chrome extension development
- **Chrome Extension Manifest V3**: Latest extension platform

## Configuration

### Manifest Configuration

The extension manifest is configured in `manifest.config.ts`. Key permissions:

- `storage`: Save user settings and presets
- `tabs`: Access current tab information
- `scripting`: Inject dimension overlay into popup windows
- `host_permissions`: Required for dimension overlay injection

### Settings

All settings are stored in Chrome's sync storage:

- `dimensionOverlayTimeout`: Duration (in ms) the overlay stays visible
- `windowPresets`: Array of viewport presets with id, name, width, and height

## Development

### File Organization

- Background scripts handle extension icon clicks and window management
- Settings page provides full preset management UI
- Dimension overlay is injected dynamically into popup windows
- Device presets are centralized in a shared constants file

### Key Features Implementation

- **Dynamic Injection**: The dimension overlay script is injected into popup windows to avoid CSP issues
- **Message Passing**: Keyboard shortcuts in popup windows communicate with the background script via message passing
- **Sync Storage**: Settings sync across devices when user is signed into Chrome

## Documentation

- [SolidJS Documentation](https://solidjs.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [CRXJS Documentation](https://crxjs.dev/vite-plugin)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
