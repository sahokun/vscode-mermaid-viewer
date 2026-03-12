const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Mermaid Viewer extension is now active');

    let disposable = vscode.commands.registerCommand('mermaid-viewer.open', function () {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;

        if (document.languageId !== 'markdown') {
            vscode.window.showErrorMessage('Please open a Markdown file');
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'mermaidViewer',
            'Mermaid Viewer: ' + path.basename(document.fileName),
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'webview'))]
            }
        );

        // Read markdown content
        const markdownContent = document.getText();

        // Get webview HTML
        panel.webview.html = getWebviewContent(panel.webview, context, markdownContent);

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'error':
                        vscode.window.showErrorMessage(message.text);
                        break;
                    case 'info':
                        vscode.window.showInformationMessage(message.text);
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

        // Update webview when document changes
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                panel.webview.postMessage({
                    command: 'update',
                    content: e.document.getText()
                });
            }
        });

        panel.onDidDispose(
            () => {
                changeDocumentSubscription.dispose();
            },
            null,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(webview, context, markdownContent) {
    const htmlPath = path.join(context.extensionPath, 'webview', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Get URI for local mermaid.js file
    const mermaidJsPath = path.join(context.extensionPath, 'webview', 'mermaid.min.js');
    const mermaidJsUri = webview.asWebviewUri(vscode.Uri.file(mermaidJsPath));

    // Escape content for safe embedding in JavaScript
    const escapedContent = JSON.stringify(markdownContent);

    // Build CSP with proper nonce for inline scripts
    const csp = `
        <meta http-equiv="Content-Security-Policy"
              content="default-src 'none';
                       script-src 'unsafe-inline' 'unsafe-eval' ${webview.cspSource};
                       style-src 'unsafe-inline' ${webview.cspSource};
                       img-src data: https: ${webview.cspSource};
                       font-src ${webview.cspSource};">
    `;

    // Insert CSP into head
    html = html.replace('<title>', csp + '<title>');

    // Replace placeholders
    html = html.replace('"{{MARKDOWN_CONTENT}}"', escapedContent);
    html = html.replace('{{MERMAID_JS_URI}}', mermaidJsUri.toString());

    return html;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
