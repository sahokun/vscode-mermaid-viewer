const fs = require('fs');
const path = require('path');

const mermaidPath = path.join(__dirname, '../webview/mermaid.min.js');
const panZoomPath = path.join(__dirname, '../preview/mermaid-pan-zoom.js');
const outputPath = path.join(__dirname, '../preview/mermaid-preview-bundle.js');

console.log('Creating preview bundle...');

try {
  // Read both files
  const mermaidContent = fs.readFileSync(mermaidPath, 'utf8');
  const panZoomContent = fs.readFileSync(panZoomPath, 'utf8');

  // Create bundle: mermaid.js content directly + pan/zoom functionality
  // Note: mermaid.min.js already exports to window.mermaid, so no IIFE wrapper needed
  const bundle = `// Mermaid.js Library (bundled)
${mermaidContent}

// Pan/Zoom functionality
${panZoomContent}
`;

  fs.writeFileSync(outputPath, bundle, 'utf8');

  const sizeMB = (Buffer.byteLength(bundle) / 1024 / 1024).toFixed(2);
  console.log(`✓ Bundle created: ${outputPath} (${sizeMB} MB)`);
} catch (error) {
  console.error('✗ Failed to create bundle:', error.message);
  process.exit(1);
}
