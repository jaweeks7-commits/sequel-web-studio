import { existsSync } from 'fs';

// Resolves the headless browser executable for the audit PDF/image pipeline:
// Microsoft Edge on Windows (Joe's machine), system Chromium on Linux
// (Codespaces / CI). Shared by every script that launches puppeteer-core so the
// path list stays in one place.
export function resolveEdgePath() {
  if (process.platform === 'win32') {
    const edgePaths = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ];
    const found = edgePaths.find(p => existsSync(p));
    if (!found) throw new Error('Microsoft Edge not found.');
    return found;
  }
  const chromiumPaths = [
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
    '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome',
  ];
  const found = chromiumPaths.find(p => existsSync(p));
  if (!found) throw new Error('Chromium not found. Run: sudo apt-get install -y chromium');
  return found;
}
