const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../node_modules/mermaid/dist/mermaid.min.js');
const dest = path.join(__dirname, '../webview/mermaid.min.js');

// ディレクトリが存在しない場合は作成
const destDir = path.dirname(dest);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

console.log('Copying mermaid.min.js from node_modules...');
try {
  fs.copyFileSync(source, dest);
  console.log('✓ Successfully copied to webview/mermaid.min.js');
} catch (error) {
  console.error('✗ Failed to copy mermaid.min.js:', error.message);
  process.exit(1);
}
