# VSCode Mermaid Viewer with Pan/Zoom

View Mermaid diagrams in Markdown files with pan and zoom functionality.

## Features

- **Standard Preview Integration**: Pan and zoom in VSCode's built-in Markdown preview
- **Advanced Viewer**: Dedicated viewer with zoom controls and large workspace
- **Multi-diagram Support**: Handle multiple Mermaid diagrams in a single file
- **Real-time Updates**: Auto-refresh on file changes
- **Lightweight**: Vanilla JavaScript implementation, no heavy dependencies

## Usage

### Method 1: Standard Markdown Preview

1. Open a Markdown file with Mermaid diagrams
2. Press **Ctrl+Shift+V** (or **Cmd+Shift+V** on Mac)
3. Use mouse wheel to zoom, drag to pan

> **Note**: This extension bundles Mermaid.js internally - no external dependencies required!

### Method 2: Advanced Viewer

1. Right-click in the editor
2. Select **"Open Advanced Mermaid Viewer"**
3. Enjoy full-featured pan/zoom with UI controls

## Controls

**Both Methods:**
- **Zoom**: Mouse wheel
- **Pan**: Click and drag
- **Reset**: Double-click

**Advanced Viewer Only:**
- Zoom controls UI (+/-/Reset buttons)
- Zoom percentage display
- Large interactive area (500px minimum height)

## Installation

### From VSIX File

1. Download the `.vsix` file from releases
2. In VSCode, open Extensions view (Ctrl+Shift+X)
3. Click "..." menu → "Install from VSIX..."
4. Select the downloaded `.vsix` file
5. Reload VSCode

### From Marketplace (Coming Soon)

Search for "Mermaid Viewer" in VSCode Extensions marketplace.

### Development Setup

1. Clone the repository
2. Run `npm install` (automatically copies Mermaid.js and generates preview bundle)
3. Press F5 to start debugging
4. Or run `npm run package` to create a `.vsix` file for local installation

## Requirements

- VSCode 1.60.0 or higher
- No external dependencies - Mermaid.js is bundled within the extension

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Development Node.js

Use Node.js 22.23.4 from `.nvmrc` (`nvm install && nvm use`). This version includes the CVE-2026-111497 Brotli fix. CI uses the same file and records the Node version and executable path. GitHub Actions use a separate runner-managed Node runtime; keep runners updated.
