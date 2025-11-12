// Export Utilities for JSON, HTML, and ZIP downloads

import type { ExportData, ResourceItem } from '../types';
import JSZip from 'jszip';

export function downloadJSON(data: ExportData | ResourceItem, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
  console.log('[EXPORT] Downloaded JSON:', filename);
}

export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, filename);
  console.log('[EXPORT] Downloaded HTML:', filename);
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
            // Handle both base64 encoded and plain text content
            let content = script.scriptContent;
            if (script.scriptContent.match(/^[A-Za-z0-9+/=]+$/)) {
              try {
                content = atob(script.scriptContent);
              } catch {
                // If decode fails, use original
                content = script.scriptContent;
              }
            }
            const safeName = sanitizeFilename(script.displayName);
            scriptsFolder.file(`${safeName}.ps1`, content);
            console.log(`[EXPORT] Added script: ${safeName}.ps1`);
          } catch (error) {
            console.warn(`[EXPORT] Failed to process script ${script.displayName}:`, error);
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
  console.log('[EXPORT] Downloaded ZIP');
}

export function generateHTMLReport(data: ExportData): string {
  const timestamp = new Date().toLocaleString();
  const reportDate = new Date().toISOString().split('T')[0];

  // Summary stats
  const totalItems = data.profiles.length + data.scripts.length + data.compliance.length + data.apps.length;
  console.log('[EXPORT] Generating HTML report with', totalItems, 'items');

  // Generate table of contents
  const hasProfiles = data.profiles.length > 0;
  const hasScripts = data.scripts.length > 0;
  const hasCompliance = data.compliance.length > 0;
  const hasApps = data.apps.length > 0;

  const tableOfContents = `
    <div class="table-of-contents">
      <h2>📋 Report Contents</h2>
      <ul>
        ${hasProfiles ? `<li><a href="#profiles">📱 Configuration Profiles (${data.profiles.length})</a></li>` : ''}
        ${hasScripts ? `<li><a href="#scripts">📜 PowerShell Scripts (${data.scripts.length})</a></li>` : ''}
        ${hasCompliance ? `<li><a href="#compliance">✓ Compliance Policies (${data.compliance.length})</a></li>` : ''}
        ${hasApps ? `<li><a href="#apps">📦 Mobile Applications (${data.apps.length})</a></li>` : ''}
      </ul>
    </div>
  `;

  // Configuration Profiles Section
  const profilesHtml = hasProfiles
    ? `<section id="profiles">
      <h2>📱 Configuration Profiles (${data.profiles.length})</h2>
      ${data.profiles
        .map(
          (profile, idx) => `
        <div class="config-section">
          <div class="section-header">
            <h3>Profile ${idx + 1}: ${escapeHtml(profile.displayName || profile.name)}</h3>
            <span class="badge ${getPlatformBadgeClass(profile.platforms)}">${escapeHtml(profile.platforms)}</span>
          </div>
          <table class="details-table">
            <tr><td class="label">Type:</td><td>${escapeHtml(profile.profileType || 'Device Configuration')}</td></tr>
            <tr><td class="label">ID:</td><td><code>${escapeHtml(profile.id)}</code></td></tr>
            <tr><td class="label">Description:</td><td>${escapeHtml(profile.description || '—')}</td></tr>
            <tr><td class="label">Created:</td><td>${formatDate(profile.createdDateTime)}</td></tr>
            <tr><td class="label">Last Modified:</td><td>${formatDate(profile.lastModifiedDateTime)}</td></tr>
          </table>
          ${
            profile.settings && profile.settings.length > 0
              ? `
            <div class="settings-section">
              <h4>Configuration Settings (${profile.settings.length})</h4>
              <table class="settings-table">
                <thead>
                  <tr><th style="width: 30%">Setting ID</th><th>Value</th></tr>
                </thead>
                <tbody>
                  ${profile.settings
                    .map(
                      (s) => `
                    <tr>
                      <td><code>${escapeHtml(s.settingDefinitionId || 'N/A')}</code></td>
                      <td><pre>${escapeHtml(JSON.stringify(s.valueJson || s.value || {}, null, 2))}</pre></td>
                    </tr>
                  `,
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
              : '<div class="no-data">ℹ️ No settings configured for this profile</div>'
          }
        </div>
      `,
        )
        .join('')}
    </section>`
    : '';

  // PowerShell Scripts Section
  const scriptsHtml = hasScripts
    ? `<section id="scripts">
      <h2>📜 PowerShell Scripts (${data.scripts.length})</h2>
      ${data.scripts
        .map(
          (script, idx) => {
            let scriptContent = '—';
            if (script.scriptContent) {
              try {
                // Handle both base64 and plain text
                if (typeof script.scriptContent === 'string' && script.scriptContent.match(/^[A-Za-z0-9+/=]+$/)) {
                  scriptContent = atob(script.scriptContent);
                } else {
                  scriptContent = script.scriptContent;
                }
              } catch (e) {
                scriptContent = '⚠️ Error decoding script content';
                console.warn('[EXPORT] Failed to decode script:', e);
              }
            }
            return `
          <div class="config-section">
            <div class="section-header">
              <h3>Script ${idx + 1}: ${escapeHtml(script.displayName)}</h3>
            </div>
            <table class="details-table">
              <tr><td class="label">ID:</td><td><code>${escapeHtml(script.id)}</code></td></tr>
              <tr><td class="label">Description:</td><td>${escapeHtml(script.description || '—')}</td></tr>
              <tr><td class="label">Execution Context:</td><td>${escapeHtml(script.executionContext || 'System')}</td></tr>
              <tr><td class="label">Run As Account:</td><td>${escapeHtml(script.runAsAccount || 'System')}</td></tr>
              <tr><td class="label">Created:</td><td>${formatDate(script.createdDateTime)}</td></tr>
              <tr><td class="label">Last Modified:</td><td>${formatDate(script.lastModifiedDateTime || '')}</td></tr>
            </table>
            <div class="script-content">
              <h4>📄 Script Content</h4>
              <pre><code class="language-powershell">${escapeHtml(scriptContent)}</code></pre>
            </div>
          </div>
        `;
          },
        )
        .join('')}
    </section>`
    : '';

  // Compliance Policies Section
  const complianceHtml = hasCompliance
    ? `<section id="compliance">
      <h2>✓ Compliance Policies (${data.compliance.length})</h2>
      ${data.compliance
        .map(
          (policy, idx) => `
        <div class="config-section">
          <div class="section-header">
            <h3>Policy ${idx + 1}: ${escapeHtml(policy.displayName)}</h3>
            <span class="badge badge-orange">${getPolicyType(policy['@odata.type'])}</span>
          </div>
          <table class="details-table">
            <tr><td class="label">ID:</td><td><code>${escapeHtml(policy.id)}</code></td></tr>
            <tr><td class="label">Description:</td><td>${escapeHtml(policy.description || '—')}</td></tr>
            <tr><td class="label">Policy Type:</td><td>${escapeHtml(policy['@odata.type'] || 'Unknown')}</td></tr>
            <tr><td class="label">Created:</td><td>${formatDate(policy.createdDateTime)}</td></tr>
            <tr><td class="label">Last Modified:</td><td>${formatDate(policy.lastModifiedDateTime)}</td></tr>
          </table>
          <div class="policy-details">
            <h4>📋 Policy Details (JSON)</h4>
            <pre>${escapeHtml(JSON.stringify(policy, null, 2))}</pre>
          </div>
        </div>
      `,
        )
        .join('')}
    </section>`
    : '';

  // Mobile Applications Section
  const appsHtml = hasApps
    ? `<section id="apps">
      <h2>📦 Mobile Applications (${data.apps.length})</h2>
      ${data.apps
        .map(
          (app, idx) => `
        <div class="config-section">
          <div class="section-header">
            <h3>App ${idx + 1}: ${escapeHtml(app.displayName)}</h3>
            <span class="badge badge-blue">${getAppType(app['@odata.type'])}</span>
          </div>
          <table class="details-table">
            <tr><td class="label">ID:</td><td><code>${escapeHtml(app.id)}</code></td></tr>
            <tr><td class="label">Publisher:</td><td>${escapeHtml(app.publisher || '—')}</td></tr>
            <tr><td class="label">Description:</td><td>${escapeHtml(app.description || '—')}</td></tr>
            <tr><td class="label">Application Type:</td><td>${escapeHtml(app['@odata.type'] || 'Unknown')}</td></tr>
            ${app.publishedDateTime ? `<tr><td class="label">Published:</td><td>${formatDate(app.publishedDateTime)}</td></tr>` : ''}
            <tr><td class="label">Created:</td><td>${formatDate(app.createdDateTime)}</td></tr>
          </table>
        </div>
      `,
        )
        .join('')}
    </section>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Intune Configuration Report - ${reportDate}</title>
  <style>
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      color: #2c3e50;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
    }

    header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
      font-weight: 600;
    }

    header .subtitle {
      font-size: 1.1em;
      opacity: 0.9;
    }

    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px 40px;
      background: #f8f9fa;
      border-bottom: 2px solid #e9ecef;
    }

    .metadata-item {
      text-align: center;
    }

    .metadata-item .number {
      display: block;
      font-size: 2em;
      font-weight: bold;
      color: #667eea;
    }

    .metadata-item .label {
      display: block;
      font-size: 0.9em;
      color: #666;
      margin-top: 5px;
    }

    main { padding: 40px; }

    .table-of-contents {
      background: #f0f4ff;
      border-left: 4px solid #667eea;
      padding: 20px 30px;
      margin-bottom: 40px;
      border-radius: 8px;
    }

    .table-of-contents h2 {
      margin-top: 0;
      color: #667eea;
    }

    .table-of-contents ul {
      list-style: none;
      padding-left: 0;
      column-count: 2;
      gap: 20px;
    }

    .table-of-contents li {
      margin-bottom: 10px;
    }

    .table-of-contents a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .table-of-contents a:hover {
      text-decoration: underline;
    }

    section {
      margin-bottom: 50px;
    }

    section > h2 {
      color: #2c3e50;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
      margin-top: 0;
      font-size: 1.8em;
    }

    .config-section {
      background: white;
      border: 1px solid #e9ecef;
      border-left: 4px solid #667eea;
      padding: 25px;
      margin-bottom: 20px;
      border-radius: 8px;
      transition: box-shadow 0.3s ease;
    }

    .config-section:hover {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .section-header h3 {
      margin: 0 15px 0 0;
      color: #2c3e50;
      font-size: 1.3em;
    }

    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge-blue { background: #d1e7f5; color: #0066cc; }
    .badge-green { background: #d4edda; color: #155724; }
    .badge-orange { background: #fff3cd; color: #856404; }
    .badge-red { background: #f8d7da; color: #721c24; }
    .badge-purple { background: #e2d5f0; color: #6f42c1; }
    .badge-gray { background: #e2e3e5; color: #383d41; }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 0.95em;
    }

    .details-table td {
      padding: 12px;
      border: 1px solid #e9ecef;
    }

    .details-table td.label {
      font-weight: 600;
      background: #f8f9fa;
      width: 25%;
      color: #667eea;
    }

    .details-table code {
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .settings-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 0.9em;
    }

    .settings-table th {
      background: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }

    .settings-table td {
      padding: 12px;
      border: 1px solid #e9ecef;
      vertical-align: top;
    }

    .settings-table tr:nth-child(even) {
      background: #f8f9fa;
    }

    .settings-section,
    .script-content,
    .policy-details {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }

    h4 {
      color: #667eea;
      margin-top: 0;
      font-size: 1.1em;
    }

    pre {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 0.85em;
      line-height: 1.4;
      margin: 10px 0;
    }

    code {
      font-family: 'Courier New', monospace;
    }

    .no-data {
      background: #e8f4f8;
      border-left: 4px solid #17a2b8;
      padding: 15px;
      border-radius: 4px;
      color: #0c5460;
      font-style: italic;
    }

    footer {
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      padding: 20px 40px;
      text-align: center;
      font-size: 0.9em;
      color: #666;
    }

    @media print {
      body { background: white; }
      .container { box-shadow: none; }
      section { page-break-inside: avoid; }
      .config-section { page-break-inside: avoid; }
    }

    @media (max-width: 768px) {
      main { padding: 20px; }
      header { padding: 40px 20px; }
      header h1 { font-size: 1.8em; }
      .metadata { grid-template-columns: 1fr; }
      .section-header { flex-direction: column; align-items: flex-start; }
      .badge { margin-top: 10px; }
      .table-of-contents ul { column-count: 1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📋 Intune Configuration Report</h1>
      <p class="subtitle">Device Management & Configuration Inventory</p>
    </header>

    <div class="metadata">
      <div class="metadata-item">
        <span class="number">${totalItems}</span>
        <span class="label">Total Items</span>
      </div>
      <div class="metadata-item">
        <span class="number">${data.profiles.length}</span>
        <span class="label">Profiles</span>
      </div>
      <div class="metadata-item">
        <span class="number">${data.scripts.length}</span>
        <span class="label">Scripts</span>
      </div>
      <div class="metadata-item">
        <span class="number">${data.compliance.length}</span>
        <span class="label">Policies</span>
      </div>
      <div class="metadata-item">
        <span class="number">${data.apps.length}</span>
        <span class="label">Applications</span>
      </div>
    </div>

    <main>
      <div class="metadata" style="background: white; border: 1px solid #e9ecef; margin-bottom: 30px;">
        <div style="flex: 1;">
          <strong>Generated:</strong> ${timestamp}
        </div>
        <div style="flex: 1; text-align: right;">
          <strong>Exported By:</strong> ${escapeHtml(data.exportedBy || 'System')}
        </div>
      </div>

      ${tableOfContents}
      ${profilesHtml}
      ${scriptsHtml}
      ${complianceHtml}
      ${appsHtml}
    </main>

    <footer>
      <p>Generated by Intune Configuration Reporter on ${timestamp}</p>
    </footer>
  </div>
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

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function getPlatformBadgeClass(platform: string): string {
  const p = platform?.toLowerCase() || '';
  if (p.includes('windows')) return 'badge-blue';
  if (p.includes('ios')) return 'badge-gray';
  if (p.includes('android')) return 'badge-green';
  if (p.includes('macos')) return 'badge-purple';
  return 'badge-blue';
}

function getPolicyType(odataType: string): string {
  if (!odataType) return 'Compliance Policy';
  if (odataType.includes('windows')) return 'Windows';
  if (odataType.includes('android')) return 'Android';
  if (odataType.includes('ios')) return 'iOS';
  if (odataType.includes('macos')) return 'macOS';
  return 'Multi-Platform';
}

function getAppType(odataType: string): string {
  if (!odataType) return 'Application';
  if (odataType.includes('iosStoreApp')) return 'iOS App Store';
  if (odataType.includes('iosVppApp')) return 'iOS VPP';
  if (odataType.includes('androidManagedStoreApp')) return 'Android Managed Store';
  if (odataType.includes('win')) return 'Windows';
  if (odataType.includes('webApp')) return 'Web Application';
  if (odataType.includes('officeSuiteApp')) return 'Microsoft 365 Apps';
  return 'Mobile Application';
}
