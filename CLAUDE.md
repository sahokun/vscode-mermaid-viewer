# VSCode Mermaid Viewer - Claude Instructions

> **⚠️ Update Policy**
>
> This file contains **architectural principles and design decisions only**.
>
> **✅ Update when**:
> - Core architecture changes
> - Technology stack changes
> - Design principle changes
>
> **❌ Do NOT update** (use DEVELOPMENT.md instead):
> - Bug fixes and workarounds
> - Feature implementation details
> - Troubleshooting guides
> - Development history

---

## Project Overview

VSCode extension for viewing Mermaid diagrams in Markdown with pan/zoom functionality.

**Key architectural decision**: Fully standalone - bundles mermaid.js instead of depending on external extensions.

---

## Core Design Principles

### 1. Vanilla JavaScript Principle

**Why**: Simplicity, zero compilation, easy debugging.

**Rule**:
- ✅ Feature implementation: Pure JavaScript, no build tools
- ✅ Development tooling: npm for dependency management and automation only

**Trade-off**: Accept npm for developer workflow (versioning, scripts) but avoid it for runtime.

---

### 2. Bundling Strategy

**Why**: VSCode Markdown preview has strict CSP - cannot load external scripts dynamically.

**Solution**: Bundle mermaid.js + pan-zoom script into single file for `markdown.previewScripts`.

**Implementation**: Simple Node.js fs concatenation (see `scripts/bundle-preview.js`).

**Key benefit**: Zero external dependencies, transparent process, easy Mermaid version updates.

---

### 3. Dual Preview Modes

**Standard Preview** (Ctrl+Shift+V):
- Uses VSCode's built-in Markdown preview
- Injects bundled script via `markdown.previewScripts`
- Subject to VSCode's strict CSP

**Advanced Viewer**:
- Custom Webview with relaxed CSP
- Loads mermaid.js via `vscode-resource://` URI
- More control but requires separate panel

**Why both**: Standard preview is seamless UX, Advanced viewer allows future features.

---

## Security Notes

- **CSP compliance**: All scripts loaded through VSCode's approved mechanisms
- **Local resources only**: Uses `webview.asWebviewUri()` for safe file access
- **No external CDN**: Everything bundled to avoid CSP violations

---

## File Organization

```
.claude/
├── CLAUDE.md           # Architecture (this file)
├── DEVELOPMENT.md      # Development history, troubleshooting
└── settings.local.json # Claude Code settings

scripts/
├── copy-mermaid.js     # npm → webview/ copy automation
└── bundle-preview.js   # Create preview bundle

preview/
├── mermaid-pan-zoom.js        # Pan/zoom source (edit this)
└── mermaid-preview-bundle.js  # Generated bundle (git-ignored)

webview/
├── index.html         # Advanced viewer UI
└── mermaid.min.js     # Copied from node_modules

extension/
└── extension.js       # VSCode extension entry point
```

---

## Key Concepts

**Pan/Zoom Implementation**: Vanilla JS with CSS transforms (no libraries).

**Theme Detection**: Reads VSCode theme from `document.body` classes, passes to Mermaid.

**Bundle Generation**: Automated via `postinstall` hook - developers never manually copy files.

---

## Development Workflow

```bash
# Setup
npm install  # Auto-copies mermaid.js + generates bundle

# Edit
# Modify preview/mermaid-pan-zoom.js

# Rebuild
npm run bundle

# Test
# F5 → Ctrl+Shift+V to test
```

---

## Known Limitations

1. Basic Markdown rendering only (headings, paragraphs)
2. No image embedding support in Markdown
3. Simple error display (console only)

---

## References

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [Markdown Preview Scripts](https://code.visualstudio.com/api/extension-guides/markdown-extension)
- [Mermaid Docs](https://mermaid.js.org/)
