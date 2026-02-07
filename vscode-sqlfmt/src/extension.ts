import * as vscode from 'vscode';
import { formatSQL } from '@vcoppola/sqlfmt';

class SQLFormattingProvider implements vscode.DocumentFormattingEditProvider {
  provideDocumentFormattingEdits(
    document: vscode.TextDocument,
  ): vscode.TextEdit[] {
    const text = document.getText();
    try {
      const formatted = formatSQL(text);
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length),
      );
      return [vscode.TextEdit.replace(fullRange, formatted)];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`sqlfmt: ${message}`);
      return [];
    }
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const provider = new SQLFormattingProvider();
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('sql', provider),
  );
}

export function deactivate(): void {}
