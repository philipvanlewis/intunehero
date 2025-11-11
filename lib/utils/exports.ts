// Export Utilities for JSON, HTML, and ZIP downloads

import type { ExportData, ResourceItem } from '../types';
import JSZip from 'jszip';

export function downloadJSON(data: ExportData | ResourceItem, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}

export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, filename);
}

export async function downloadZIP(
  data: ExportData,
  scripts: Array<{ displayName: string; scriptContent?: string }>,
): Promise<void> {
  const zip = new JSZip();

  // Add main JSON file
  zip.file('intune-config.json', JSON.stringify(data, null, 2));

  // Add individual scripts if available
  if (scripts && scripts.length > 0) {
    const scriptsFolder = zip.folder('scripts');
    if (scriptsFolder) {
      scripts.forEach((script) => {
        if (script.scriptContent) {
          try {
            const content = atob(script.scriptContent);
            const safeName = sanitizeFilename(script.displayName);
            scriptsFolder.file(`${safeName}.ps1`, content);
          } catch (error) {
            console.warn(`Failed to decode script ${script.displayName}:`, error);
          }
        }
      });
    }
  }

  // Add HTML report
  const html = generateHTMLReport(data);
  zip.file('report.html', html);

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().split('T')[0];
  downloadBlob(blob, `intune-config-${timestamp}.zip`);
}

export function generateHTMLReport(data: ExportData): string {
  const timestamp = new Date().toLocaleString();

  const profilesHtml = data.profiles
    .map(
      (profile) => `
    <div class="config-section">
      <h2>${escapeHtml(profile.name)}</h2>
      <p><strong>Description:</strong> ${escapeHtml(profile.description || 'None')}</p>
      <p><strong>Platform:</strong> ${escapeHtml(profile.platforms)}</p>
      ${
        profile.settings && profile.settings.length > 0
          ? `
        <table>
          <thead>
            <tr><th>Setting ID</th><th>Value</th></tr>
          </thead>
          <tbody>
            ${profile.settings
              .map(
                (s) => `
              <tr>
                <td>${escapeHtml(s.settingDefinitionId || 'N/A')}</td>
                <td><pre>${escapeHtml(JSON.stringify(s.valueJson || s, null, 2))}</pre></td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      `
          : '<p>No settings available</p>'
      }
    </div>
  `,
    )
    .join('');

  const scriptsHtml = data.scripts
    .map((script) => {
      let scriptContent = 'No content available';
      if (script.scriptContent) {
        try {
          scriptContent = atob(script.scriptContent);
        } catch {
          scriptContent = 'Error decoding script content';
        }
      }
      return `
    <div class="config-section">
      <h2>Script: ${escapeHtml(script.displayName)}</h2>
      <p><strong>Description:</strong> ${escapeHtml(script.description || 'None')}</p>
      <pre>${escapeHtml(scriptContent)}</pre>
    </div>
  `;
    })
    .join('');

  const complianceHtml = data.compliance
    .map(
      (policy) => `
    <div class="config-section">
      <h2>Compliance: ${escapeHtml(policy.displayName)}</h2>
      <p><strong>Description:</strong> ${escapeHtml(policy.description || 'None')}</p>
      <pre>${escapeHtml(JSON.stringify(policy, null, 2))}</pre>
    </div>
  `,
    )
    .join('');

  const appsHtml = data.apps
    .map(
      (app) => `
    <div class="config-section">
      <h2>App: ${escapeHtml(app.displayName)}</h2>
      <p><strong>Publisher:</strong> ${escapeHtml(app.publisher || 'Unknown')}</p>
      <p><strong>Description:</strong> ${escapeHtml(app.description || 'None')}</p>
    </div>
  `,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Intune Configuration Report</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 40px;
      background-color: #f8f9fa;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 10px;
    }
    h2 {
      color: #2c3e50;
      margin-top: 30px;
    }
    .config-section {
      background-color: #fff;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid #6366f1;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    pre {
      background-color: #f4f4f4;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #6366f1;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .metadata {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>Intune Configuration Report</h1>
  <div class="metadata">
    <p><strong>Generated:</strong> ${timestamp}</p>
    <p><strong>Items Exported:</strong> ${data.profiles.length} profiles, ${data.scripts.length} scripts, ${data.compliance.length} policies, ${data.apps.length} apps</p>
  </div>

  ${data.profiles.length > 0 ? `<h2>Configuration Profiles</h2>${profilesHtml}` : ''}
  ${data.scripts.length > 0 ? `<h2>PowerShell Scripts</h2>${scriptsHtml}` : ''}
  ${data.compliance.length > 0 ? `<h2>Compliance Policies</h2>${complianceHtml}` : ''}
  ${data.apps.length > 0 ? `<h2>Applications</h2>${appsHtml}` : ''}
</body>
</html>`;
}

// Helper Functions

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
