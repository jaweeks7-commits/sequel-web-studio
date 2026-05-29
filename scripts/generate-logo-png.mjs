import puppeteer from 'puppeteer-core';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const executablePath = edgePaths.find(p => existsSync(p));
if (!executablePath) throw new Error('Microsoft Edge not found.');

const html = `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; }
body { width: 400px; height: 400px; overflow: hidden; }
</style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#1F3864"/>
  <polygon points="90,75 90,325 335,200" fill="#2E75B6"/>
  <text x="162" y="250" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="140" font-weight="700" fill="white">S</text>
</svg>
</body>
</html>`;

const outPath = join(ROOT, 'logo-options', 'sequel-web-studio-logo-square.png');

console.log('Launching Edge…');
const browser = await puppeteer.launch({ executablePath, headless: true });
const page    = await browser.newPage();
await page.setViewport({ width: 400, height: 400, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 400, height: 400 } });
await browser.close();

console.log(`✓ Logo saved to: ${outPath}`);
