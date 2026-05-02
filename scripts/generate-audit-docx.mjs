import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import HTMLtoDOCX from 'html-to-docx';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const html = readFileSync(join(ROOT, 'bsr-bikeshop-pro-diagnosis-april-2026.html'), 'utf8');

// Strip syntax-highlighting spans (html-to-docx cannot process CSS colors on spans).
// Do NOT globally decode &lt;/&gt; — the audit HTML contains encoded HTML snippets
// throughout the findings text, and decoding them globally causes rogue tags that
// corrupt the DOCX XML. html-to-docx decodes entities natively when building text runs.
// Page break hint for html-to-docx (CSS page-break-before is ignored).
const cleaned = html
  .replace(/<span class="(kw|val|cm|at|st)">/g, '')
  .replace(/<\/span>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/<br style="page-break-before:always"\s*\/>/g,
    '<br style="page-break-before: always; mso-break-type: section-break" />');

const options = {
  orientation: 'portrait',
  margins: { top: 720, right: 1080, bottom: 720, left: 1080, header: 720, footer: 720, gutter: 0 },
  font: 'Calibri',
  fontSize: 22,
  complexScriptsFont: 'Calibri',
  title: 'Pro Diagnosis + Remedy Package — BSR Bike Shop',
  subject: 'Website Audit Report — April 2026',
  creator: 'Sequel Web Studio',
  table: { row: { cantSplit: true } },
  lineNumber: false,
};

console.log('Converting HTML to DOCX…');
const docxBuffer = await HTMLtoDOCX(cleaned, null, options);

const outPath = join(ROOT, 'BSR-Bike-Shop-Remedy-Package-April-2026.docx');
writeFileSync(outPath, docxBuffer);
console.log('Done:', outPath);
