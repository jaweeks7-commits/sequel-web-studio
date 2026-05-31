import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import { checkPagination, report as reportPagination } from './check-pagination.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const MONTH_NUMS = {
  january:'01', february:'02', march:'03', april:'04', may:'05', june:'06',
  july:'07', august:'08', september:'09', october:'10', november:'11', december:'12'
};

// Escape HTML special characters in text fields so that references to HTML code in
// step instructions (e.g. "<script type='application/ld+json'>") are rendered as
// visible text rather than parsed as DOM elements. The standalone.code fields are
// pre-escaped in the JSON and must NOT be double-escaped here.
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Hard-fail if the score grid (Executive Summary) disagrees with the data that
// would render alongside it. Critical / HighValue are action counts and must
// match the Priority Action List. Pass / NiceToHave are check counts and must
// match the audit findings table (auditChecks + bChecks tallies).
function validateScores(data) {
  const labelOf = c => (c?.badgeLabel || '').trim();
  const auditCheckValues = Object.entries(data.auditChecks)
    .filter(([k]) => !k.startsWith('_'))
    .map(([, v]) => v);
  const allChecks = [...auditCheckValues, ...data.bChecks];

  const priorityCritical = data.priorityItems.filter(p => p.badge === 'critical').length;
  const priorityHigh     = data.priorityItems.filter(p => p.badge === 'high').length;
  const passCount        = allChecks.filter(c => labelOf(c) === 'Pass').length;
  const niceCount        = allChecks.filter(c => labelOf(c) === 'Nice to Have').length;

  const errors = [];
  if (data.scores.critical !== priorityCritical) {
    errors.push(`scores.critical = ${data.scores.critical}, but priorityItems with badge="critical" = ${priorityCritical}`);
  }
  if (data.scores.highValue !== priorityHigh) {
    errors.push(`scores.highValue = ${data.scores.highValue}, but priorityItems with badge="high" = ${priorityHigh}`);
  }
  if (data.scores.pass !== passCount) {
    errors.push(`scores.pass = ${data.scores.pass}, but Pass entries in auditChecks + bChecks = ${passCount}`);
  }
  if (data.scores.niceToHave !== niceCount) {
    errors.push(`scores.niceToHave = ${data.scores.niceToHave}, but Nice to Have entries in auditChecks + bChecks = ${niceCount}`);
  }

  if (errors.length > 0) {
    console.error('\nScore reconciliation FAILED:');
    errors.forEach(e => console.error('  - ' + e));
    console.error('\nThe Critical and High Value totals in the score grid must match the Priority Action List counts.');
    console.error('The Pass and Nice to Have totals must match the actual tallies in auditChecks + bChecks.');
    console.error('Fix the data file and re-run.\n');
    process.exit(1);
  }
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

// Compute output dir: {AUDIT_OUTPUT_DIR}/{YYYY-MM}/{client-slug}
const fileBase = basename(inputArg, '.json');
const dateMatch = fileBase.match(/-audit-data-([a-z]+)-(\d{4})$/i);
const BASE_DIR = process.env.AUDIT_OUTPUT_DIR ?? 'C:\\Sequel Audit Deliverables';
let outputDir;
if (dateMatch) {
  const monthNum = MONTH_NUMS[dateMatch[1].toLowerCase()] ?? '01';
  const yearMonth = `${dateMatch[2]}-${monthNum}`;
  const clientSlug = fileBase.slice(0, fileBase.indexOf('-audit-data-'));
  outputDir = join(BASE_DIR, yearMonth, clientSlug);
} else {
  outputDir = join(BASE_DIR, 'unsorted');
}
mkdirSync(outputDir, { recursive: true });
copyFileSync(dataPath, join(outputDir, basename(inputArg)));

const data = JSON.parse(readFileSync(dataPath, 'utf8'));
validateScores(data);
let html = readFileSync(join(ROOT, 'templates/audit-report-template.html'), 'utf8');

// Derived scalars
const totalChecks = 28 + data.bChecks.length;
const categoryCount = 8 + (data.bChecks.length > 0 ? 1 : 0);

// Output filename: swap -audit-data- for -pro-diagnosis-
const outFilename = basename(inputArg)
  .replace(/\.json$/i, '.html')
  .replace('-audit-data-', '-pro-diagnosis-');
const outPath = join(outputDir, outFilename);

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

// ── Reverse map: remedyItem number → check IDs that share it ──────────────
const remedyToChecks = {};
for (const [id, check] of Object.entries(data.auditChecks)) {
  if (id.startsWith('_')) continue;
  if (check.remedyItem != null) {
    (remedyToChecks[check.remedyItem] ||= []).push(id);
  }
}
for (const bc of data.bChecks) {
  if (bc.remedyItem != null) {
    (remedyToChecks[bc.remedyItem] ||= []).push(bc.id);
  }
}

// ── Remedy items with auto-inserted Critical / High Value dividers ─────────
//
// Items may opt into Part A / Part B sibling layout (CLAUDE.md §14) by setting
// `partOf: "previous"` on the second card. When set, that card reuses the
// previous card's logical item number, suffixes the displayed label with
// " (Part B)", and suppresses the covers-note (which already showed on Part A).
// The auto-numbering of subsequent items continues from the shared number, so
// priorityItems and the remedyItem references in auditChecks/bChecks remain in
// sync without bookkeeping.
// Render one remedy card. When codeOnly is true (synthesized Part B from auto-split),
// the card omits Audit Findings + Remedy steps and renders only the standalone code
// block. The header still shows the badge, item number ("Item N (Part B)"), and title
// so the reader knows which remedy this code is for.
function renderCardHtml(item, num, isPartB, codeOnly) {
  const badgeLabel = item.badge === 'critical' ? 'Critical' : 'High Value';
  const itemLabel  = isPartB ? `Item ${num} (Part B)` : `Item ${num}`;

  // Standalone code is rendered with each source line in its own .code-line block
  // (CLAUDE.md §14). Each line is an atomic unit with break-inside: avoid, so page
  // breaks fall only between full source lines — no mid-line clipping.
  // item.standalone.code is already HTML-escaped in the JSON and must NOT be
  // re-escaped here; we split on \n only.
  const codeLinesHtml = item.standalone
    ? item.standalone.code.split('\n')
        .map(line => `<div class="code-line">${line.length ? line : '&nbsp;'}</div>`)
        .join('')
    : '';
  const standaloneHtml = item.standalone
    ? `\n      <div class="standalone-callout">${esc(item.standalone.label)}</div>\n      <pre class="standalone-code">${codeLinesHtml}</pre>`
    : '';

  // Cards containing a large standalone code block get the `has-standalone` modifier
  // so the print CSS lets the code flow across page boundaries. check-pagination.mjs
  // exempts these from the hard 1056 px page-height fail.
  // Part B cards get `is-part-b` so the print CSS can force them to start on a fresh page.
  const baseClass = item.standalone ? 'remedy-item has-standalone' : 'remedy-item';
  const itemClass = isPartB ? `${baseClass} is-part-b` : baseClass;

  // Code-only synthesized Part B (auto-split from a standalone-having item): minimal
  // card with header + standalone block, no findings/steps. The findings and steps
  // live on Part A so they never flow across a page boundary.
  if (codeOnly) {
    return `
  <div class="${itemClass}">
    <div class="remedy-item-head">
      <div class="remedy-item-tag"><span class="remedy-label ${item.badge}">${badgeLabel}</span><span class="remedy-item-num">${itemLabel}</span></div>
      <div class="remedy-item-title">${item.title}</div>
    </div>
    <div class="remedy-sub">${standaloneHtml}
    </div>
  </div>`;
  }

  const stepsHtml = item.steps.map(s =>
    `        <div class="remedy-step">${esc(s)}</div>`
  ).join('\n');

  // covers-note only on Part A (or non-split items). Part B card omits it.
  const coveredChecks = isPartB ? [] : (remedyToChecks[num] || []);
  const coversNoteHtml = coveredChecks.length > 1
    ? `\n      <div class="remedy-covers-note">This remedy addresses <strong>${coveredChecks.length} audit findings</strong>: ${coveredChecks.map(checkDisplayName).join(' · ')} — see the Audit Results section for individual findings.</div>`
    : '';

  // .remedy-item-head bundles tag + title + optional covers-note + Audit Findings
  // so the card identity never appears alone at the bottom of a page (CLAUDE.md §14).
  return `
  <div class="${itemClass}">
    <div class="remedy-item-head">
      <div class="remedy-item-tag"><span class="remedy-label ${item.badge}">${badgeLabel}</span><span class="remedy-item-num">${itemLabel}</span></div>
      <div class="remedy-item-title">${item.title}</div>${coversNoteHtml}
      <div class="remedy-sub">
        <div class="remedy-sub-label">Audit Findings</div>
        <div class="remedy-finding">${esc(item.findings)}</div>
      </div>
    </div>
    <div class="remedy-sub">
      <div class="remedy-sub-label">Remedy — Step by Step</div>
      <div class="remedy-steps">
${stepsHtml}
      </div>${standaloneHtml}
    </div>
  </div>`;
}

function buildRemedyItems(items) {
  let out = '';
  let criticalDividerDone = false;
  let highDividerDone = false;
  let logicalNum = 0;       // The "Item N" number shown to the reader
  let prevLogicalNum = 0;   // Track for partOf: "previous"

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isPartB = item.partOf === 'previous';
    const num = isPartB ? prevLogicalNum : ++logicalNum;
    prevLogicalNum = num;

    if (!criticalDividerDone && item.badge === 'critical') {
      out += '\n  <div class="remedy-divider">Critical Items — Fix These First</div>\n';
      criticalDividerDone = true;
    }
    if (!highDividerDone && item.badge === 'high') {
      out += '\n  <div class="remedy-divider">High Value Items</div>\n';
      highDividerDone = true;
    }

    // Auto-split: any item with a standalone code block renders as TWO cards.
    // Card A: badge + title + findings + steps (NO standalone). break-inside: avoid
    //   keeps it atomic — no clipping at page boundaries.
    // Card B: synthesized code-only Part B with just the standalone block. Flows
    //   across pages as needed (has-standalone), but contains no prose that could
    //   be clipped — only the code, which breaks safely between source lines.
    // This eliminates the visible clipping on flowing cards (Item 3 llms.txt,
    // Item 9 schema entity graph) without requiring any JSON authoring changes.
    if (item.standalone && !isPartB) {
      const cardAItem = { ...item, standalone: null };
      out += renderCardHtml(cardAItem, num, false, false);
      out += renderCardHtml(item,     num, true,  true);
    } else {
      out += renderCardHtml(item, num, isPartB, false);
    }
  }
  return out;
}
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

// Customer-friendly name lookup for covers-note (B-check names come from data)
const bCheckNames = Object.fromEntries(
  data.bChecks.map(bc => [bc.id, `${bc.id} · ${bc.name}`])
);
function checkDisplayName(id) {
  return CHECK_NAMES[id] || bCheckNames[id] || id;
}
html = html.replace('{{REMEDY_ITEMS}}', buildRemedyItems(data.remedyItems));

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

// ── Pre-flight pagination check ────────────────────────────────────────────
// Renders the HTML in print mode and measures every .remedy-item / .check-card /
// .score-grid. Hard-fails the build if any block exceeds 1056 px (one page),
// because such a block will clip in the PDF (see CLAUDE.md §14). Soft warnings
// for blocks over the 640/1000 budgets are surfaced but do not fail the build.
// Set env SKIP_PAGINATION_CHECK=1 to bypass (not recommended).
if (process.env.SKIP_PAGINATION_CHECK === '1') {
  console.log('\nSKIP_PAGINATION_CHECK=1 set; skipping pre-flight pagination check.');
} else {
  console.log('\nRunning pre-flight pagination check…');
  const result = await checkPagination(outPath);
  reportPagination(result);
  if (result.hardFailures.length > 0) {
    console.error('\nPagination check failed. Fix the JSON and re-run fill-template before generating the PDF.');
    process.exit(1);
  }
}

console.log(`\nNext: node scripts/generate-audit-pdf.mjs "${outPath}"`);
