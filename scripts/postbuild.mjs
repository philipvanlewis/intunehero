import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const outDir = path.join(projectRoot, 'out');

// Ensure out directory exists
if (!fs.existsSync(outDir)) {
  console.error('Error: out directory does not exist. Run build first.');
  process.exit(1);
}

// Write _redirects file for Cloudflare Pages SPA routing
const redirectsContent = '/*  /index.html  200\n';
fs.writeFileSync(path.join(outDir, '_redirects'), redirectsContent);
console.log('✓ Created _redirects file');

// Write _routes.json file for Cloudflare Pages routing config
const routesContent = JSON.stringify(
  {
    version: 1,
    include: ['/*'],
    exclude: ['_next/*', '/api/*']
  },
  null,
  2
) + '\n';
fs.writeFileSync(path.join(outDir, '_routes.json'), routesContent);
console.log('✓ Created _routes.json file');

console.log('\nCloudflare Pages configuration files created successfully!');
