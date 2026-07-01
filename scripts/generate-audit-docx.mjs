import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, basename } from 'path';
import HTMLtoDOCX from 'html-to-docx';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Input HTML from the CLI (relative or absolute); mirrors generate-audit-pdf.mjs.
const inputArg = process.argv[2] ?? 'bsr-bikeshop-pro-diagnosis-april-2026.html';
const htmlPath = resolve(inputArg);

// Derive names from the input, e.g.
//   acme-plumbing-pro-diagnosis-may-2026.html
//     → Acme-Plumbing (client) / May-2026 (date) → Acme-Plumbing-Remedy-Package-May-2026.docx
const baseName  = basename(inputArg, '.html');
const diagMatch = baseName.match(/^(.+)-pro-diagnosis-(.+)$/i);
const titleCase = s => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
const [clientSlug, dateSlug] = diagMatch ? [diagMatch[1], diagMatch[2]] : [baseName, ''];
const clientName = titleCase(clientSlug).replace(/-/g, ' ');
const dateName   = dateSlug ? titleCase(dateSlug).replace(/-/g, ' ') : '';

const html = readFileSync(htmlPath, 'utf8');

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
  title: `Pro Diagnosis + Remedy Package — ${clientName}`,
  subject: `Website Audit Report${dateName ? ` — ${dateName}` : ''}`,
  creator: 'Sequel Web Studio',
  table: { row: { cantSplit: true } },
  lineNumber: false,
};

console.log('Converting HTML to DOCX…');
const docxBuffer = await HTMLtoDOCX(cleaned, null, options);

const outName = dateSlug
  ? `${titleCase(clientSlug)}-Remedy-Package-${titleCase(dateSlug)}.docx`
  : `${titleCase(baseName)}-Remedy-Package.docx`;
const outPath = join(dirname(htmlPath), outName);
writeFileSync(outPath, docxBuffer);
console.log('Done:', outPath);
