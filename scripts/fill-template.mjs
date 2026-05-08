import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Escape HTML special characters in text fields so that references to HTML code in
// step instructions (e.g. "<script type='application/ld+json'>") are rendered as
// visible text rather than parsed as DOM elements. The standalone.code fields are
// pre-escaped in the JSON and must NOT be double-escaped here.
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const inputArg = process.argv[2];
if (!inputArg) {
  console.error('Usage: node scripts/fill-template.mjs <client>-audit-data-<month>-<year>.json');
  console.error('Example: node scripts/fill-template.mjs acme-plumbing-audit-data-may-2026.json');
  process.exit(1);
}

const dataPath = join(ROOT, inputArg);
if (!existsSync(dataPath)) {
  console.error(`Data file not found: ${dataPath}`);
  process.exit(1);
}

const data = JSON.parse(readFileSync(dataPath, 'utf8'));
let html = readFileSync(join(ROOT, 'templates/audit-report-template.html'), 'utf8');

// Derived scalars
const totalChecks = 28 + data.bChecks.length;
const categoryCount = 8 + (data.bChecks.length > 0 ? 1 : 0);

// Output filename: swap -audit-data- for -pro-diagnosis-
const outFilename = inputArg
  .replace(/\.json$/i, '.html')
  .replace('-audit-data-', '-pro-diagnosis-');
const outPath = join(ROOT, outFilename);

// ── Scalar replacements ────────────────────────────────────────────────────
const scalars = {
  CLIENT_NAME:        data.client.name,
  SITE_URL:           data.client.siteUrl,
  SITE_URL_FULL:      data.client.siteUrlFull,
  AUDIT_DATE:         data.client.auditDate,
  AUDIT_MONTH_YEAR:   data.client.auditMonthYear,
  PLATFORM:           data.client.platform,
  TOTAL_CHECKS:       String(totalChecks),
  STANDARD_CHECKS:    '28',
  BONUS_CHECKS:       String(data.bChecks.length),
  CRITICAL_COUNT:     String(data.scores.critical),
  HIGH_VALUE_COUNT:   String(data.scores.highValue),
  PASS_COUNT:         String(data.scores.pass),
  NICE_TO_HAVE_COUNT: String(data.scores.niceToHave),
  EXEC_HEADLINE:      data.execSummary.headline,
  EXEC_BODY:          data.execSummary.body,
  CATEGORY_COUNT:     String(categoryCount),
};
for (const [key, val] of Object.entries(scalars)) {
  html = html.replaceAll(`{{${key}}}`, val);
}

// ── Deliverables list ──────────────────────────────────────────────────────
const deliverableHtml = data.deliverables.length > 0
  ? data.deliverables.map(d =>
      `<div class="deliverable-item"><span class="deliverable-badge">${d.ref}</span><span>${d.desc}</span></div>`
    ).join('\n      ')
  : '<p style="font-size:13px;color:#8892A0;margin-top:8px;">No standalone code deliverables for this client.</p>';
html = html.replace('{{DELIVERABLES_LIST}}', deliverableHtml);

// ── Priority items ─────────────────────────────────────────────────────────
const priorityHtml = data.priorityItems.map((item, i) =>
  `<div class="priority-item ${item.badge}"><div class="priority-num ${item.badge}">${i + 1}</div><div class="priority-text">${item.text}</div></div>`
).join('\n    ');
html = html.replace('{{PRIORITY_ITEMS}}', priorityHtml);

// ── Remedy items with auto-inserted Critical / High Value dividers ─────────
function buildRemedyItems(items) {
  let out = '';
  let criticalDividerDone = false;
  let highDividerDone = false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const num = i + 1;

    if (!criticalDividerDone && item.badge === 'critical') {
      out += '\n  <div class="remedy-divider">Critical Items — Fix These First</div>\n';
      criticalDividerDone = true;
    }
    if (!highDividerDone && item.badge === 'high') {
      out += '\n  <div class="remedy-divider">High Value Items</div>\n';
      highDividerDone = true;
    }

    const badgeLabel = item.badge === 'critical' ? 'Critical' : 'High Value';
    const stepsHtml = item.steps.map(s =>
      `        <div class="remedy-step">${esc(s)}</div>`
    ).join('\n');
    const standaloneHtml = item.standalone
      ? `\n      <div class="standalone-callout">${esc(item.standalone.label)}</div>\n      <pre>${item.standalone.code}</pre>`
      : '';

    out += `
  <div class="remedy-item">
    <div class="remedy-item-tag"><span class="remedy-label ${item.badge}">${badgeLabel}</span><span class="remedy-item-num">Item ${num}</span></div>
    <div class="remedy-item-title">${item.title}</div>
    <div class="remedy-sub">
      <div class="remedy-sub-label">Audit Findings</div>
      <div class="remedy-finding">${esc(item.findings)}</div>
    </div>
    <div class="remedy-sub">
      <div class="remedy-sub-label">Remedy — Step by Step</div>
      <div class="remedy-steps">
${stepsHtml}
      </div>${standaloneHtml}
    </div>
  </div>`;
  }
  return out;
}
html = html.replace('{{REMEDY_ITEMS}}', buildRemedyItems(data.remedyItems));

// ── Check name lookup (28 standard checks — never changes) ────────────────
const CHECK_NAMES = {
  C01_1: "Your Website's Name in Google (Page Title)",
  C01_2: "Your Google Elevator Pitch (Meta Description)",
  C01_3: "Telling Google Which Version of Your Site Is Official (Canonical Tag)",
  C01_4: 'Your "Do Not Disturb" Sign for Google (Robots Meta Tag)',
  C01_5: "Your Page's Outline — The One Google Actually Reads (Heading Structure)",
  C01_6: 'Telling Google "This Is The Real Page" — Inner Pages (Inner Canonicals)',
  C02_1: "The Photo That Shows Up When You Share Your Link (OG Image)",
  C02_2: "The Full Story Behind Every Social Share (Open Graph Tags)",
  C02_3: "The Same Thing, Specifically for X (Twitter Cards)",
  C03_1: "How Fast Does Your Server Respond? (TTFB)",
  C03_2: "How Long Until Your Page Is Fully Ready (Total Load)",
  C03_3: "Are Your Photos Slowing You Down? (Image Optimization)",
  C03_4: "What Is Making Your Site Wait? (Third-Party Services)",
  C03_5: "Is JavaScript Holding Up Your Page? (Script Loading)",
  C04_1: "Do You Speak Google's Language? (Structured Data Presence)",
  C04_2: "Are Your Schema Blocks Talking to Each Other? (Schema Connectivity)",
  C04_3: "Rich Result Types You Are Missing Out On",
  C05_1: "Is Google Analytics Actually On?",
  C05_2: "Is Your Tracking Counting Everything Twice? (Duplicate Pixel Firing)",
  C05_3: "What Is Secretly Loading on Your Website? (Third-Party Inventory)",
  C06_1: "What Are You Telling Search Engines They Can't Read? (Robots.txt)",
  C06_2: "Is Your Website Secure? (HTTPS)",
  C06_3: "A Simple Security Setting Most Sites Miss (External Link noopener)",
  C06_4: "Are You Telling AI How to Represent You? (llms.txt)",
  C07_1: "Can Google (and Blind Users) Understand Your Images? (Alt Text)",
  C07_2: "Does Your Site Know What Language It's Written In? (Lang Attribute)",
  C08_1: "What Website Builder Was This Site Built On?",
  C08_2: "Is Your Site Ready for AI-Powered Search?",
};

const CATEGORY_CHECKS = {
  CAT_01: ['C01_1','C01_2','C01_3','C01_4','C01_5','C01_6'],
  CAT_02: ['C02_1','C02_2','C02_3'],
  CAT_03: ['C03_1','C03_2','C03_3','C03_4','C03_5'],
  CAT_04: ['C04_1','C04_2','C04_3'],
  CAT_05: ['C05_1','C05_2','C05_3'],
  CAT_06: ['C06_1','C06_2','C06_3','C06_4'],
  CAT_07: ['C07_1','C07_2'],
  CAT_08: ['C08_1','C08_2'],
};

function buildCheckCard(checkId, check, displayName) {
  const name = displayName || CHECK_NAMES[checkId] || checkId;
  if (check.remedyItem) {
    return `<div class="check-card">
  <div class="check-header"><div class="check-name">${name}</div><span class="badge ${check.badgeClass}">${check.badgeLabel}</span></div>
  <div class="see-remedy-note">Results and implementation guidance for this check are covered in detail in the <strong>Remedy Package above — Item ${check.remedyItem}</strong>.</div>
</div>`;
  }
  const technicalHtml = check.technical
    ? `\n<div class="label">Technical Detail</div><div class="technical">${esc(check.technical)}</div>`
    : '';
  return `<div class="check-card">
  <div class="check-header"><div class="check-name">${name}</div><span class="badge ${check.badgeClass}">${check.badgeLabel}</span></div>
  <div class="check-found"><strong>Found:</strong> ${esc(check.found)}</div>
  <div class="label">Business Impact</div><div class="impact">${esc(check.impact)}</div>${technicalHtml}
</div>`;
}

// ── Standard category checks ───────────────────────────────────────────────
for (const [catKey, checkIds] of Object.entries(CATEGORY_CHECKS)) {
  const marker = `{{${catKey}_CHECKS}}`;
  const cardsHtml = checkIds.map(id => {
    const check = data.auditChecks[id];
    if (!check) { console.warn(`Warning: no data for ${id} — skipping`); return ''; }
    return buildCheckCard(id, check);
  }).filter(Boolean).join('\n\n');
  html = html.replace(marker, cardsHtml);
}

// ── B-checks ───────────────────────────────────────────────────────────────
const bChecksHtml = data.bChecks.map(check => {
  const displayName = `${check.id} · ${check.name}`;
  return buildCheckCard(check.id, check, displayName);
}).join('\n\n');
html = html.replace('{{B_CHECKS}}', bChecksHtml);

// ── Write output ───────────────────────────────────────────────────────────
writeFileSync(outPath, html, 'utf8');
console.log('Done:', outPath);
console.log(`Next: node scripts/generate-audit-pdf.mjs ${outFilename}`);
