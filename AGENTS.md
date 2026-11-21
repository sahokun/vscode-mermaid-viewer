# Mermaid Viewer with Pan/Zoom

<!-- Working rules for this repository, for both AI agents (Claude Code, Codex, etc.) and people.
     Rewrite the "Project-specific" section per project; keep the "Common rules" section identical across all of sahokun's repositories. -->

## Project-specific

### Overview

A VS Code extension for viewing Mermaid diagrams in Markdown with pan and zoom. It is fully standalone: it bundles mermaid.js instead of depending on other extensions.

Keep this section to architectural principles and design decisions. Do not record bug fixes, workarounds, or development history here.

### Tech stack and layout

- Plain JavaScript at runtime, with no build tools for features. npm is used only for dependency management and automation (versioning, scripts).
- Bundling: VS Code's Markdown preview has a strict CSP and cannot load external scripts dynamically, so mermaid.js and the pan/zoom script are concatenated into one file for `markdown.previewScripts` (`scripts/bundle-preview.js`, plain Node.js `fs`). There are no external CDNs.
- Two preview modes:
  - Standard preview (Ctrl+Shift+V): VS Code's built-in Markdown preview, with the bundled script injected through `markdown.previewScripts`.
  - Advanced viewer: a custom Webview with a relaxed CSP that loads mermaid.js through `webview.asWebviewUri()`.
- Layout:
  - `extension/extension.js`: extension entry point.
  - `preview/mermaid-pan-zoom.js`: pan/zoom source (edit this). `preview/mermaid-preview-bundle.js` is generated and git-ignored.
  - `webview/index.html`: advanced viewer UI. `webview/mermaid.min.js` is copied from `node_modules`.
  - `scripts/copy-mermaid.js`, `scripts/bundle-preview.js`: run by the `postinstall` hook, so nobody copies files by hand.
- Pan/zoom uses CSS transforms without libraries. The theme is read from `document.body` classes and passed to Mermaid.
- Known limitations: basic Markdown rendering only (headings, paragraphs), no embedded images, errors shown in the console only.

### Verification

```bash
npm install        # copies mermaid.js and generates the bundle
npm run bundle     # rebuild after editing preview/mermaid-pan-zoom.js
npm run package    # vsce package (also run in CI)
```

- Press F5 in VS Code, then Ctrl+Shift+V in a Markdown file with a Mermaid block to test.

## Common rules

### Branches and PRs

<!-- branch-model:begin -->
- The default branch is `main`. Work on a branch and open a PR into `main`.
- PRs are squash-merged. Each PR leaves a single commit on main, titled with the PR title only.
<!-- branch-model:end -->
- Write PR titles in Conventional Commits form (`feat: ...`, `fix: ...`, etc.) so the change is clear from one line.
- Merged branches are deleted automatically.

### Never put these in history or anything published

- Do not write email addresses, tokens, passwords, details of a personal environment, or links to AI agent sessions in commits, PRs, issues, or comments.
  - Work-branch commits and PRs stay on GitHub after merging, and even the owner cannot delete them. Rewriting main's history needs a force push and a request to GitHub Support. Only PR descriptions can be fixed later by editing.
- Commit with your GitHub noreply address (`<ID>+<username>@users.noreply.github.com`) as the author email.
- Do not commit `.env`, key files, or local settings (`.claude/settings.local.json`, etc.).

### Dependencies

- Only add or update to versions published at least 7 days ago. Hijacked or swapped releases are often discovered shortly after publication.
  - Dependabot version updates wait 7 days via `cooldown`. For npm, `min-release-age=7` in `.npmrc` applies the same limit to manual updates.
- Pin GitHub Actions to a full 40-character commit SHA and keep the version as a trailing comment (e.g. `actions/checkout@<SHA> # v7.0.1`). Tags can be moved.
- Treat Dependabot PRs as a signal that updates exist. Merge them once CI passes, and for major updates, after reviewing the changes.
