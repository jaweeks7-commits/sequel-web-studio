import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const ARCHIVE_ROOT = 'C:\\Sequel Audit Deliverables\\2026-05';
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

const CHECK_NAMES = {
  C01_1: 'Title tag quality (length / keyword stuffing)',
  C01_2: 'Meta description quality',
  C01_3: 'Canonical tag present and correct',
  C01_4: 'Robots meta tag',
  C01_5: 'H1 heading present on homepage',
  C01_6: 'Inner page canonicals',
  C02_1: 'Open Graph image (proper 1200x630 social share image)',
  C02_2: 'Open Graph tags completeness',
  C02_3: 'Twitter/X card tags',
  C03_1: 'Time to First Byte (TTFB)',
  C03_2: 'Core Web Vitals / LCP on mobile',
  C03_3: 'Image optimization (WebP / compression)',
  C03_4: 'Third-party script inventory',
  C03_5: 'Render-blocking resources',
  C04_1: 'Schema.org LocalBusiness markup',
  C04_2: 'Schema entity linking (@id and sameAs)',
  C04_3: 'Rich Results eligibility',
  C05_1: 'Google Analytics present and configured',
  C05_2: 'GA4 duplicate tag detection',
  C05_3: 'Third-party script cleanliness',
  C06_1: 'robots.txt completeness',
  C06_2: 'HTTPS / SSL enforcement',
  C06_3: 'External link security (noopener)',
  C06_4: 'llms.txt presence',
  C07_1: 'Image alt text quality',
  C07_2: 'HTML lang attribute',
  C08_1: 'Platform identification',
  C08_2: 'AI Citation Readiness Score (0-5)',
  B01:   'Mobile viewport meta tag',
  B03:   'HTTP to HTTPS redirect',
  B04:   'Non-www to www redirect',
  B05:   '404 error page quality',
  B06:   'Sitemap accuracy',
  B07:   'Duplicate pages in sitemap',
  B08:   'Cookie consent / GDPR compliance',
  B09:   'Privacy policy linked',
  B10:   'Physical address on homepage',
  B11:   'Phone number with tap-to-call',
  B12:   'Social media links present',
  B13:   'Embedded map on contact page',
  B19:   'Favicon formats',
  B20:   'Copyright year current',
  B21:   'Broken navigation links',
  B22:   'Contact form functional',
  B23:   'Missing images on server',
  B_AI1: 'sameAs authority links for AI entity verification',
  B_AI2: 'FAQPage schema present',
};

async function findAuditFiles(root) {
  const files = [];
  const folders = await readdir(root, { withFileTypes: true });
  for (const folder of folders) {
    if (!folder.isDirectory()) continue;
    const folderPath = join(root, folder.name);
    const entries = await readdir(folderPath);
    for (const entry of entries) {
      if (entry.includes('audit-data') && entry.endsWith('.json')) {
        files.push(join(folderPath, entry));
      }
    }
  }
  return files;
}

function countChecks(audit) {
  return Object.keys(audit.auditChecks || {}).length + (audit.bChecks?.length || 0);
}

async function main() {
  const files = await findAuditFiles(ARCHIVE_ROOT);
  console.log(`Found ${files.length} audit data files in ${ARCHIVE_ROOT}\n`);

  // Parse all files and deduplicate by siteUrl, keeping the richer record
  const auditMap = new Map();
  for (const filePath of files) {
    const raw = await readFile(filePath, 'utf-8');
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.warn(`  Skipping (parse error): ${filePath}`);
      continue;
    }
    const url = data.client?.siteUrl || data.client?.siteUrlFull || filePath;
    if (auditMap.has(url)) {
      if (countChecks(data) > countChecks(auditMap.get(url))) {
        auditMap.set(url, data);
      }
    } else {
      auditMap.set(url, data);
    }
  }

  const audits = Array.from(auditMap.values());
  const n = audits.length;
  console.log(`Unique sites after deduplication: ${n}\n`);

  // ── Score averages ──────────────────────────────────────────────────────────
  const avg = (field) =>
    (audits.reduce((sum, a) => sum + (a.scores?.[field] || 0), 0) / n).toFixed(1);

  const criticalCounts = audits.map(a => a.scores?.critical || 0);
  const withCritical = criticalCounts.filter(c => c > 0).length;

  console.log('=== SCORE AVERAGES ===');
  console.log(`  Avg critical findings per site:   ${avg('critical')}`);
  console.log(`  Avg high-value findings per site: ${avg('highValue')}`);
  console.log(`  Avg passing checks per site:      ${avg('pass')}`);
  console.log(`  Avg nice-to-have per site:        ${avg('niceToHave')}`);
  console.log(`\n  Sites with ≥1 critical finding: ${withCritical}/${n} (${Math.round(withCritical/n*100)}%)`);
  console.log(`  Sites with 0 critical findings: ${n - withCritical}/${n} (${Math.round((n-withCritical)/n*100)}%)`);

  // ── Critical distribution ───────────────────────────────────────────────────
  const critDist = {};
  for (const c of criticalCounts) critDist[c] = (critDist[c] || 0) + 1;

  console.log('\n=== CRITICAL FINDING DISTRIBUTION ===');
  for (const [k, v] of Object.entries(critDist).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const bar = '█'.repeat(v);
    console.log(`  ${k} critical: ${String(v).padStart(2)} site${v !== 1 ? 's' : ''}  ${bar}`);
  }

  // ── Most-missed checks ──────────────────────────────────────────────────────
  const checkFreq = {};

  for (const audit of audits) {
    for (const [id, check] of Object.entries(audit.auditChecks || {})) {
      if (!checkFreq[id]) checkFreq[id] = { critical: 0, high: 0, total: 0 };
      if (check.badgeClass === 'badge-critical') { checkFreq[id].critical++; checkFreq[id].total++; }
      else if (check.badgeClass === 'badge-high') { checkFreq[id].high++; checkFreq[id].total++; }
    }
    for (const check of (audit.bChecks || [])) {
      const id = check.id;
      if (!id) continue;
      if (!checkFreq[id]) checkFreq[id] = { critical: 0, high: 0, total: 0 };
      if (check.badgeClass === 'badge-critical') { checkFreq[id].critical++; checkFreq[id].total++; }
      else if (check.badgeClass === 'badge-high') { checkFreq[id].high++; checkFreq[id].total++; }
    }
  }

  const ranked = Object.entries(checkFreq)
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => b[1].total - a[1].total);

  console.log('\n=== MOST COMMON FAILING CHECKS (top 15) ===');
  console.log('  ID       Sites  Crit  High  Name');
  console.log('  ─────────────────────────────────────────────────────────────────');
  for (const [id, counts] of ranked.slice(0, 15)) {
    const name = CHECK_NAMES[id] || id;
    const pct = Math.round(counts.total / n * 100);
    console.log(
      `  ${id.padEnd(8)} ${String(counts.total).padStart(2)}/${n} (${String(pct).padStart(2)}%)  `
      + `${String(counts.critical).padStart(2)}cr  ${String(counts.high).padStart(2)}hi  ${name}`
    );
  }

  // ── Platform distribution ───────────────────────────────────────────────────
  const platforms = {};
  for (const audit of audits) {
    const p = audit.client?.platform || 'Unknown';
    platforms[p] = (platforms[p] || 0) + 1;
  }
  console.log('\n=== PLATFORM DISTRIBUTION ===');
  for (const [p, count] of Object.entries(platforms).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(2)}x  ${p}`);
  }

  // ── AI Citation Readiness ───────────────────────────────────────────────────
  const aiScores = [];
  for (const audit of audits) {
    const found = audit.auditChecks?.C08_2?.found || '';
    const m = found.match(/Score:\s*(\d)/i);
    if (m) aiScores.push(Number(m[1]));
  }
  if (aiScores.length > 0) {
    const avgAI = (aiScores.reduce((a, b) => a + b, 0) / aiScores.length).toFixed(1);
    const low = aiScores.filter(s => s <= 2).length;
    const aiDist = {};
    for (const s of aiScores) aiDist[s] = (aiDist[s] || 0) + 1;
    console.log('\n=== AI CITATION READINESS (C08_2, scale 0–5) ===');
    console.log(`  Sites with score data: ${aiScores.length}/${n}`);
    console.log(`  Average score: ${avgAI}/5`);
    console.log(`  Scoring 0–2 (poor): ${low}/${aiScores.length} (${Math.round(low/aiScores.length*100)}%)`);
    console.log('  Distribution:', Object.entries(aiDist).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k,v])=>`${k}/5: ${v}`).join(', '));
  }

  // ── Write summary JSON ──────────────────────────────────────────────────────
  const summary = {
    generatedAt: new Date().toISOString(),
    archiveRoot: ARCHIVE_ROOT,
    totalFiles: files.length,
    uniqueSites: n,
    averages: {
      critical: Number(avg('critical')),
      highValue: Number(avg('highValue')),
      pass: Number(avg('pass')),
      niceToHave: Number(avg('niceToHave')),
    },
    criticalDistribution: critDist,
    sitesWithAnyCritical: { count: withCritical, pct: Math.round(withCritical / n * 100) },
    sitesWithZeroCritical: { count: n - withCritical, pct: Math.round((n - withCritical) / n * 100) },
    mostMissedChecks: ranked.slice(0, 20).map(([id, counts]) => ({
      id,
      name: CHECK_NAMES[id] || id,
      critical: counts.critical,
      high: counts.high,
      total: counts.total,
      pct: Math.round(counts.total / n * 100),
    })),
    platforms,
    aiReadiness: aiScores.length > 0 ? {
      sitesWithData: aiScores.length,
      average: Number((aiScores.reduce((a, b) => a + b, 0) / aiScores.length).toFixed(1)),
      distribution: Object.fromEntries(
        Object.entries(
          aiScores.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {})
        ).sort((a, b) => Number(a[0]) - Number(b[0]))
      ),
    } : null,
  };

  const outPath = join(SCRIPT_DIR, 'audit-research-summary.json');
  await writeFile(outPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`\nSummary written to: ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
