import puppeteer from 'puppeteer-core';
import { existsSync, unlinkSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join, resolve, basename } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
const executablePath = edgePaths.find(p => existsSync(p));
if (!executablePath) throw new Error('Microsoft Edge not found — install Edge or switch to the puppeteer package.');

const inputArg = process.argv[2];
if (!inputArg) {
  console.error('Usage: node scripts/generate-audit-pdf.mjs <html-filename>');
  console.error('Example: node scripts/generate-audit-pdf.mjs acme-plumbing-pro-diagnosis-may-2026.html');
  process.exit(1);
}

// Derive output PDF name from input HTML name:
//   acme-plumbing-pro-diagnosis-may-2026.html → Acme-Plumbing-Remedy-Package-May-2026.pdf
const baseName = basename(inputArg, '.html');
const diagMatch = baseName.match(/^(.+)-pro-diagnosis-(.+)$/i);
const titleCase = s => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
const [clientSlug, dateSlug] = diagMatch
  ? [diagMatch[1], diagMatch[2]]
  : [baseName, ''];
const outName = dateSlug
  ? `${titleCase(clientSlug)}-Remedy-Package-${titleCase(dateSlug)}.pdf`
  : `${titleCase(baseName)}-Remedy-Package.pdf`;

// resolve() handles both relative filenames (old usage) and absolute paths (new usage)
const htmlPath = resolve(inputArg);
const outPath  = join(dirname(htmlPath), outName);

console.log('Launching Edge…');
const browser = await puppeteer.launch({ executablePath, headless: true });
const page    = await browser.newPage();

// 816×1056 px = US Letter at 96 dpi → 100vh = one page height (matches cover min-height)
await page.setViewport({ width: 816, height: 1056 });
// Switch to print media before loading so Edge computes print layout from the start.
// Without this, page.pdf() switches to print mid-render and long documents may truncate.
await page.emulateMediaType('print');
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0', timeout: 30000 });

console.log('Generating PDF…');
await page.pdf({
  path: outPath,
  format: 'Letter',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});

await browser.close();
unlinkSync(htmlPath);
console.log('Done:', outPath);
