import sharp from 'sharp';
import { mkdirSync, readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, basename } from 'path';

// LinkedIn post images: one 1080×1080 PNG per insights article.
// Source of truth for punchlines: scripts/linkedin-hooks.json
// Article metadata (category): src/content/insights/*.md frontmatter
// Output: C:\Sequel LinkedIn Articles\images\{slug}.png

const __dirname     = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR   = resolve(__dirname, '..', 'src', 'content', 'insights');
const HOOKS_PATH    = resolve(__dirname, 'linkedin-hooks.json');
const OUTPUT_DIR    = 'C:\\Sequel LinkedIn Articles\\images';

mkdirSync(OUTPUT_DIR, { recursive: true });

const hooks = JSON.parse(readFileSync(HOOKS_PATH, 'utf8'));

const CATEGORY_LABELS = {
  methodology: 'METHODOLOGY',
  pricing:     'PRICING & ROI',
  findings:    'COMMON FINDINGS',
  myths:       'MYTHS & MISCONCEPTIONS',
  deliverable: 'WHAT YOU RECEIVE',
};

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseFrontmatter(md) {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) {
      let value = m[2].trim();
      value = value.replace(/^['"]|['"]$/g, '');
      fm[m[1]] = value;
    }
  }
  return fm;
}

function pickFontSize(text) {
  const len = text.length;
  if (len <= 60)  return 62;
  if (len <= 90)  return 56;
  if (len <= 120) return 50;
  return 46;
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= maxChars) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildSvg(category, hook) {
  const fontSize   = pickFontSize(hook);
  // Usable width: 1080 - 80 (left padding) - 80 (right padding) = 920px
  // Arial bold char width ≈ 0.54 × font-size
  const maxChars   = Math.floor(920 / (fontSize * 0.54));
  const lines      = wrapText(hook, maxChars);
  const lineHeight = Math.round(fontSize * 1.18);

  // Vertically center the punchline block around y=540 (canvas mid).
  // For SVG text, y is the baseline; first-line baseline sits below visual top.
  const centerY = 540;
  const startY  = centerY + Math.round(fontSize * 0.35) - Math.round(((lines.length - 1) * lineHeight) / 2);

  const categoryLabel = CATEGORY_LABELS[category] || category.toUpperCase();
  const badgeText     = `INSIGHTS · ${categoryLabel}`;
  // Badge sizing: 13px Arial bold with 2.5px letter-spacing ≈ 11px per char + 56px padding
  const badgeWidth    = Math.round(badgeText.length * 11 + 56);

  const punchlineTags = lines.map((line, i) => {
    const y = startY + i * lineHeight;
    return `  <text x="80" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="white">${escapeXml(line)}</text>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.1)"/>
    </pattern>
    <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2E75B6"/>
      <stop offset="100%" stop-color="#8E44AD"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1080" fill="#0F1F3D"/>
  <rect width="1080" height="1080" fill="url(#dots)"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="8" height="1080" fill="url(#brandGrad)"/>

  <!-- Badge pill -->
  <rect x="80" y="100" width="${badgeWidth}" height="42" rx="21" fill="rgba(142,68,173,0.2)" stroke="#8E44AD" stroke-width="1.5"/>
  <text x="${80 + badgeWidth / 2}" y="127" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#c084fc" text-anchor="middle" letter-spacing="2.5">${escapeXml(badgeText)}</text>

  <!-- Punchline -->
${punchlineTags}

  <!-- Divider -->
  <line x1="80" y1="970" x2="1000" y2="970" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

  <!-- Brand wordmark -->
  <text x="1000" y="1010" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="rgba(255,255,255,0.45)" text-anchor="end">Sequel Web Studio</text>
  <text x="80" y="1010" font-family="Arial, sans-serif" font-size="19" fill="rgba(255,255,255,0.3)">sequelwebstudio.com/insights</text>
</svg>`;
}

// --- Main ---

const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).sort();
let generated = 0;
let skipped   = 0;
let warned    = 0;

console.log(`\nGenerating LinkedIn images for ${files.length} insights articles:\n`);

for (const file of files) {
  const slug = basename(file, '.md');
  const hook = hooks[slug];
  if (!hook) {
    console.warn(`  SKIP  ${slug} (no entry in linkedin-hooks.json)`);
    skipped++;
    continue;
  }

  const md       = readFileSync(join(CONTENT_DIR, file), 'utf8');
  const fm       = parseFrontmatter(md);
  const category = fm.category || 'methodology';

  if (hook.length > 120) {
    console.warn(`  WARN  ${slug} hook is ${hook.length} chars (may render small or overflow)`);
    warned++;
  }

  const svg     = buildSvg(category, hook);
  const outPath = join(OUTPUT_DIR, `${slug}.png`);
  await sharp(Buffer.from(svg)).resize(1080, 1080).png().toFile(outPath);
  console.log(`  ${slug}.png  (${category}, ${hook.length} chars)`);
  generated++;
}

console.log(`\nDone. Generated: ${generated}. Skipped: ${skipped}. Warnings: ${warned}.`);
console.log(`Output: ${OUTPUT_DIR}`);
