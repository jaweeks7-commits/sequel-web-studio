import puppeteer from 'puppeteer-core';
import { PDFParse } from 'pdf-parse';
import { existsSync, mkdtempSync } from 'fs';
import { readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join, resolve, basename } from 'path';
import { exec } from 'child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let executablePath;
if (process.platform === 'win32') {
  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  executablePath = edgePaths.find(p => existsSync(p));
  if (!executablePath) throw new Error('Microsoft Edge not found — install Edge or switch to the puppeteer package.');
} else {
  // Linux — system Chromium installed by codespace-init.sh
  const chromiumPaths = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
  ];
  executablePath = chromiumPaths.find(p => existsSync(p));
  if (!executablePath) throw new Error('Chromium not found. Run: sudo apt-get install -y chromium');
}

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

// Use an isolated temp profile so a launch cannot be blocked by other Edge instances
// the user already has open (the Singleton lock on a shared user-data-dir is the root
// cause of the "Failed to launch the browser process: Code: 0" error seen in May 2026).
const userDataDir = mkdtempSync(join(tmpdir(), 'audit-pdf-'));
console.log(`Launching ${process.platform === 'win32' ? 'Edge' : 'Chromium'} (profile: ${userDataDir})…`);
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  userDataDir,
  args: [
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
  ],
});
const page    = await browser.newPage();

// 816×1056 px = US Letter at 96 dpi → 100vh = one page height (matches cover min-height)
await page.setViewport({ width: 816, height: 1056 });
// Switch to print media before loading so Edge computes print layout from the start.
// Without this, page.pdf() switches to print mid-render and long documents may truncate.
await page.emulateMediaType('print');
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0', timeout: 30000 });

// Orphaned-divider fix only. Screen-mode heights ≠ print-mode layout, so injecting
// break-before:page on .remedy-item cards based on measured heights creates blank pages.
// Oversized cards must be handled editorially (Part A / Part B split in the HTML).
await page.evaluate(() => {
  const PAGE_H   = 1056;
  const ORPHAN_Z = 120;  // px from page bottom where a divider is considered stranded

  document.querySelectorAll('.remedy-divider').forEach(el => {
    const posOnPage = el.getBoundingClientRect().bottom % PAGE_H;
    if (posOnPage > PAGE_H - ORPHAN_Z) {
      el.style.breakBefore     = 'page';
      el.style.pageBreakBefore = 'always';
    }
  });
});

console.log('Generating PDF…');
await page.pdf({
  path: outPath,
  format: 'Letter',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});

await browser.close();
console.log('Done:', outPath);

// Post-PDF QC: two checks. (1) Blank-page detection (very low char count) catches the
// recurring failure mode of a navy-filled page with no content. (2) Clipping detection
// flags adjacent page pairs where page N ends without a sentence terminator AND page N+1
// begins mid-sentence, which is the signature of a remedy card overflow that escaped the
// pre-flight pagination check.
console.log('\nRunning post-PDF QC…');
const pdfBuffer = await readFile(outPath);
const parser = new PDFParse({ data: pdfBuffer });
const { pages } = await parser.getText();
const pageText = (p) => (typeof p === 'string' ? p : p.text || '').trim();

const blankFlagged = pages
  .map((p, i) => ({ page: i + 1, chars: pageText(p).length }))
  .filter(p => p.chars < 80);
blankFlagged.forEach(p => console.log(`⚠ Page ${p.page}: only ${p.chars} chars of text — verify visually.`));

// Clipping heuristic. Terminator chars include normal sentence punctuation plus closing
// braces/quotes/brackets (code blocks legitimately end on those). A page that ends with
// any of those and is followed by a page beginning with a capital or quote is "clean".
// A page ending without a terminator followed by a lowercase or digit start is suspicious.
const TERMINATORS = /[.!?:"')\]}>…]\s*$/;
const MID_SENTENCE_START = /^[\p{Ll}\d,;]/u;
const clipFlagged = [];
for (let i = 0; i < pages.length - 1; i++) {
  const a = pageText(pages[i]);
  const b = pageText(pages[i + 1]);
  if (a.length < 80 || b.length < 80) continue;
  const tail = a.slice(-80);
  const head = b.slice(0, 60);
  if (!TERMINATORS.test(tail) && MID_SENTENCE_START.test(head)) {
    clipFlagged.push({ pair: `${i + 1}→${i + 2}`, tail: tail.slice(-40), head: head.slice(0, 40) });
  }
}
clipFlagged.forEach(c => console.log(`⚠ Possible clipping ${c.pair}: "...${c.tail}" → "${c.head}..."`));

console.log(`Pages scanned: ${pages.length}. Blank-page flags: ${blankFlagged.length}. Clipping flags: ${clipFlagged.length}.`);
await parser.destroy();

// QC: open the finished PDF for visual review. Page-break layout only exists in the PDF
// renderer — screen-layout screenshots don't reflect it, so the PDF itself is the only
// reliable QC artifact.
console.log('\nOpening PDF for visual QC review…');
if (process.platform === 'win32') {
  exec(`start "" "${outPath}"`);
} else {
  exec(`xdg-open "${outPath}"`);
}
console.log('Review the PDF, then close it. Run archiving steps when satisfied.');
