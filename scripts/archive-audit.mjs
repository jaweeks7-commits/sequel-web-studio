// Post-delivery archive & cleanup for audit sessions (automates CLAUDE.md §13).
//
// The build pipeline already writes the HTML, PDF, and a JSON copy directly into
// C:\Sequel Audit Deliverables\{YYYY-MM}\{client-slug}\ — so this script's job is
// sweeping the leftovers (root JSON/HTML/PDF copies, audit-tool session artifacts)
// into the archive and verifying everything ended up where it belongs.
//
// Usage:
//   node scripts/archive-audit.mjs <client>-audit-data-<month>-<year>.json [--dry-run]
//   node scripts/archive-audit.mjs --slug <client-slug> --month <YYYY-MM> [--dry-run]

import { existsSync, mkdirSync, readdirSync, statSync, renameSync, copyFileSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Same month map and filename convention as fill-template.mjs — keep in sync.
const MONTH_NUMS = {
  january:'01', february:'02', march:'03', april:'04', may:'05', june:'06',
  july:'07', august:'08', september:'09', october:'10', november:'11', december:'12'
};

// ── Parse arguments ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const flagVal = (name) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
};

let clientSlug = flagVal('--slug');
let yearMonth = flagVal('--month');

if (!clientSlug) {
  const fileArg = args.find(a => !a.startsWith('--') && a !== yearMonth);
  const m = fileArg ? basename(fileArg, '.json').match(/^(.+)-audit-data-([a-z]+)-(\d{4})$/i) : null;
  if (!m) {
    console.error('Usage: node scripts/archive-audit.mjs <client>-audit-data-<month>-<year>.json [--dry-run]');
    console.error('   or: node scripts/archive-audit.mjs --slug <client-slug> --month <YYYY-MM> [--dry-run]');
    process.exit(1);
  }
  clientSlug = m[1];
  yearMonth = `${m[3]}-${MONTH_NUMS[m[2].toLowerCase()] ?? '01'}`;
}
if (!/^\d{4}-\d{2}$/.test(yearMonth ?? '')) {
  console.error(`--month must be YYYY-MM (got: ${yearMonth})`);
  process.exit(1);
}

const BASE_DIR = process.env.AUDIT_OUTPUT_DIR ?? 'C:\\Sequel Audit Deliverables';
const archiveDir = join(BASE_DIR, yearMonth, clientSlug);
const titleCase = s => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
const titleSlug = titleCase(clientSlug);

console.log(`Client: ${clientSlug}  Month: ${yearMonth}${dryRun ? '  (DRY RUN — nothing will be moved)' : ''}`);
console.log(`Archive: ${archiveDir}\n`);

if (!dryRun) mkdirSync(archiveDir, { recursive: true });

// renameSync fails across drives (EXDEV); fall back to copy+delete.
function moveFile(src, dest) {
  try { renameSync(src, dest); }
  catch { copyFileSync(src, dest); unlinkSync(src); }
}

// Move src into the archive. If an identical-size copy is already there, just
// delete src; if sizes differ, the src (most recent build/edit) replaces it.
function sweep(src) {
  const dest = join(archiveDir, basename(src));
  const srcSize = statSync(src).size;
  if (existsSync(dest)) {
    if (statSync(dest).size === srcSize) {
      console.log(`  identical copy already archived — deleting: ${src}`);
      if (!dryRun) unlinkSync(src);
      return;
    }
    console.log(`  archive copy differs — replacing with: ${src}`);
  } else {
    console.log(`  moving: ${src}`);
  }
  if (!dryRun) moveFile(src, dest);
}

// ── 1. Repo root sweep ──────────────────────────────────────────────────────
console.log('Repo root sweep:');
const rootMatches = readdirSync(ROOT).filter(f => {
  const lower = f.toLowerCase();
  return (
    (lower.startsWith(`${clientSlug}-`) && /\.(json|html|png|pdf)$/i.test(f)) ||
    (f.startsWith(`${titleSlug}-`) && lower.endsWith('.pdf'))
  );
});
if (rootMatches.length === 0) console.log('  nothing to sweep.');
rootMatches.forEach(f => sweep(join(ROOT, f)));

// ── 2. audit-tool/ sweep ────────────────────────────────────────────────────
console.log('\naudit-tool/ sweep:');
const auditToolDir = join(ROOT, 'audit-tool');
const toolMatches = existsSync(auditToolDir)
  ? readdirSync(auditToolDir).filter(f => {
      const lower = f.toLowerCase();
      return (lower.startsWith(`${clientSlug}-`) || f.startsWith(`${titleSlug}-`)) &&
             statSync(join(auditToolDir, f)).isFile();
    })
  : [];
if (toolMatches.length === 0) console.log('  nothing to sweep.');
toolMatches.forEach(f => sweep(join(auditToolDir, f)));

// ── 3. Possible session screenshots ─────────────────────────────────────────
// Playwright MCP saves screenshots as page-{timestamp}.png in .playwright-mcp/.
// Renaming needs human/Claude judgment ({client-slug}-screenshot-{description}.png),
// so only remind — never auto-rename.
const shotsDir = join(ROOT, '.playwright-mcp');
if (existsSync(shotsDir)) {
  const cutoff = Date.now() - 12 * 60 * 60 * 1000;
  const recent = readdirSync(shotsDir).filter(f =>
    f.toLowerCase().endsWith('.png') && statSync(join(shotsDir, f)).mtimeMs > cutoff
  );
  if (recent.length > 0) {
    console.log('\nPossible session screenshots in .playwright-mcp/ (modified in the last 12h):');
    recent.forEach(f => console.log(`  ${f}`));
    console.log(`  → rename to ${clientSlug}-screenshot-{description}.png and move to the archive folder.`);
  }
}

// ── 4. Verification summary ─────────────────────────────────────────────────
const archived = existsSync(archiveDir) ? readdirSync(archiveDir) : [];
const PERMANENT_TOOL_FILES = ['audit.js', 'readme.md', 'audits', 'example images', '_for-deletion-review'];
const toolLeftovers = existsSync(auditToolDir)
  ? readdirSync(auditToolDir).filter(f => !PERMANENT_TOOL_FILES.includes(f.toLowerCase()))
  : [];
const rootLeftovers = readdirSync(ROOT).filter(f =>
  f.toLowerCase().startsWith(`${clientSlug}-`) || f.startsWith(`${titleSlug}-`)
);

const checks = [
  ['Remedy Package PDF in archive', archived.some(f => /-remedy-package-.*\.pdf$/i.test(f)), true],
  ['Audit data JSON in archive', archived.some(f => /-audit-data-.*\.json$/i.test(f)), true],
  ['Intake progress file archived', archived.some(f => /-intake-progress\.md$/i.test(f)), false],
  ['audit-tool/ clean (permanent files only)', toolLeftovers.length === 0, false],
  ['Repo root clean of client files', rootLeftovers.length === 0, false],
];

console.log(`\nVerification summary${dryRun ? ' (dry run — reflects current state, not post-move state)' : ''}:`);
let failed = false;
for (const [label, ok, required] of checks) {
  console.log(`  ${ok ? '✓' : '✗'} ${label}${ok || required ? '' : '  (warning)'}`);
  if (!ok && required) failed = true;
}
if (toolLeftovers.length > 0) console.log(`    audit-tool leftovers: ${toolLeftovers.join(', ')}`);
if (rootLeftovers.length > 0) console.log(`    root leftovers: ${rootLeftovers.join(', ')}`);
console.log(`\nArchive contents (${archived.length} file${archived.length === 1 ? '' : 's'}):`);
archived.forEach(f => console.log(`  ${f}`));

if (failed && !dryRun) {
  console.error('\nFAILED: the PDF and/or audit data JSON are missing from the archive. The archive is the single source of truth for delivered audits — locate the files and re-run.');
  process.exit(1);
}
