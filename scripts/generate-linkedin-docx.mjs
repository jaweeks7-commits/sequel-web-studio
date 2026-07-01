import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import HTMLtoDOCX from 'html-to-docx';
import { escapeHtml } from './lib/escape.mjs';

// Canonical article source: src/content/insights/ (website is single source of truth)
// Output: C:\Sequel LinkedIn Articles\ (.docx for LinkedIn posting)
// LinkedIn-only files (00-intro, RELEASE-SEQUENCE) remain in the output folder and are read directly.

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR   = resolve(__dirname, '..', 'src', 'content', 'insights');
const LINKEDIN_DIR  = 'C:\\Sequel LinkedIn Articles';

if (!existsSync(LINKEDIN_DIR)) {
  mkdirSync(LINKEDIN_DIR, { recursive: true });
  console.log(`Created folder: ${LINKEDIN_DIR}`);
}


// Strip YAML frontmatter (---...---) from the top of a markdown string
function stripFrontmatter(md) {
  const trimmed = md.trimStart();
  if (!trimmed.startsWith('---')) return md;
  const end = trimmed.indexOf('\n---', 3);
  if (end === -1) return md;
  return trimmed.slice(end + 4).trimStart();
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  const renderInline = (text) => {
    let t = escapeHtml(text);
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    return t;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    const hr = /^(-{3,}|_{3,}|\*{3,})\s*$/;
    if (hr.test(line.trim())) {
      out.push('<hr />');
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote><p>${renderInline(quote.join(' ').trim())}</p></blockquote>`);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i++;
      }
      out.push('<ul>' + items.map((it) => `<li>${renderInline(it.trim())}</li>`).join('') + '</ul>');
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      out.push('<ol>' + items.map((it) => `<li>${renderInline(it.trim())}</li>`).join('') + '</ol>');
      continue;
    }

    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^(-{3,}|_{3,}|\*{3,})\s*$/.test(lines[i].trim())
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${renderInline(para.join(' ').trim())}</p>`);
  }

  return out.join('\n');
}

function mdToLinkedInText(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  const stripInline = (text) => text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1');

  const pushBlank = () => { if (out.length > 0 && out[out.length - 1] !== '') out.push(''); };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(line.trim())) {
      pushBlank();
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      pushBlank();
      out.push(stripInline(heading[2].trim()));
      out.push('');
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(stripInline(quote.join(' ').trim()));
      out.push('');
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        out.push('→ ' + stripInline(lines[i].replace(/^\s*[-*+]\s+/, '').trim()));
        i++;
      }
      out.push('');
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      let num = 1;
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        out.push(`${num++}. ` + stripInline(lines[i].replace(/^\s*\d+\.\s+/, '').trim()));
        i++;
      }
      out.push('');
      continue;
    }

    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^(-{3,}|_{3,}|\*{3,})\s*$/.test(lines[i].trim())
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(stripInline(para.join(' ').trim()));
    out.push('');
  }

  while (out.length > 0 && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

async function convertFile(mdPath, docxPath, label) {
  const mdSource = readFileSync(mdPath, 'utf8');
  const bodyContent = stripFrontmatter(mdSource);
  const bodyHtml = mdToHtml(bodyContent);

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.45; color: #222; }
    h1 { font-size: 20pt; color: #1F3864; margin-top: 0; margin-bottom: 12pt; }
    h2 { font-size: 14pt; color: #1F3864; margin-top: 16pt; margin-bottom: 8pt; }
    h3 { font-size: 12pt; color: #1F3864; margin-top: 12pt; margin-bottom: 6pt; }
    p  { margin-top: 0; margin-bottom: 10pt; }
    ul, ol { margin-top: 0; margin-bottom: 10pt; padding-left: 20pt; }
    li { margin-bottom: 4pt; }
    strong { color: #1F3864; }
    em { color: #595959; }
    blockquote { border-left: 3pt solid #2E75B6; padding-left: 10pt; color: #595959; margin: 10pt 0; }
    code { font-family: Consolas, monospace; font-size: 10pt; background: #F2F2F2; padding: 1pt 3pt; }
    hr { border: none; border-top: 1pt solid #D9D9D9; margin: 14pt 0; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
    orientation: 'portrait',
    margins: { top: 1080, right: 1080, bottom: 1080, left: 1080, header: 720, footer: 720, gutter: 0 },
    font: 'Calibri',
    fontSize: 22,
    complexScriptsFont: 'Calibri',
    creator: 'Sequel Web Studio',
    table: { row: { cantSplit: true } },
    lineNumber: false,
  });

  writeFileSync(docxPath, docxBuffer);
  console.log(`  ${label}`);
}

// --- Main ---

let generated = 0;
let failed    = 0;

// 1. Articles from src/content/insights/ → C:\Sequel LinkedIn Articles\
if (!existsSync(CONTENT_DIR)) {
  console.error(`Content directory not found: ${CONTENT_DIR}`);
  process.exit(1);
}

const contentFiles = readdirSync(CONTENT_DIR)
  .filter(f => extname(f).toLowerCase() === '.md')
  .sort();

console.log(`\nArticles from src/content/insights/ (${contentFiles.length} files):`);

for (const mdFile of contentFiles) {
  const mdPath   = join(CONTENT_DIR, mdFile);
  const docxName = basename(mdFile, '.md') + '.docx';
  const docxPath = join(LINKEDIN_DIR, docxName);
  const txtName  = basename(mdFile, '.md') + '.txt';
  const txtPath  = join(LINKEDIN_DIR, txtName);
  try {
    await convertFile(mdPath, docxPath, `${mdFile}  -->  ${docxName}`);
    const mdSource = readFileSync(mdPath, 'utf8');
    writeFileSync(txtPath, mdToLinkedInText(stripFrontmatter(mdSource)), 'utf8');
    generated++;
  } catch (err) {
    console.error(`  FAILED  ${mdFile}: ${err.message}`);
    failed++;
  }
}

// 2. LinkedIn-only files from C:\Sequel LinkedIn Articles\ (only files with no counterpart
//    in src/content/insights/ — currently just 00-intro-series-announcement.md)
const contentSlugs = new Set(contentFiles.map(f => basename(f, '.md')));
const linkedinOnlyFiles = readdirSync(LINKEDIN_DIR)
  .filter(f => {
    if (extname(f).toLowerCase() !== '.md') return false;
    if (f === 'RELEASE-SEQUENCE.md') return false;
    // Skip files whose slug (strip leading NN- prefix) matches a content file
    const slug = basename(f, '.md').replace(/^\d+-/, '');
    return !contentSlugs.has(slug) && !contentSlugs.has(basename(f, '.md'));
  })
  .sort();

if (linkedinOnlyFiles.length > 0) {
  console.log(`\nLinkedIn-only files from ${LINKEDIN_DIR} (${linkedinOnlyFiles.length} files):`);
  for (const mdFile of linkedinOnlyFiles) {
    const mdPath   = join(LINKEDIN_DIR, mdFile);
    const docxName = basename(mdFile, '.md') + '.docx';
    const docxPath = join(LINKEDIN_DIR, docxName);
    const txtName  = basename(mdFile, '.md') + '.txt';
    const txtPath  = join(LINKEDIN_DIR, txtName);
    try {
      await convertFile(mdPath, docxPath, `${mdFile}  -->  ${docxName}`);
      const mdSource = readFileSync(mdPath, 'utf8');
      writeFileSync(txtPath, mdToLinkedInText(stripFrontmatter(mdSource)), 'utf8');
      generated++;
    } catch (err) {
      console.error(`  FAILED  ${mdFile}: ${err.message}`);
      failed++;
    }
  }
}

console.log(`\nDone. Generated: ${generated}. Failed: ${failed}.`);
process.exit(failed === 0 ? 0 : 1);
