// Pre-flight pagination check for audit HTML.
//
// Renders the HTML in print mode via Edge/Chromium, measures every
// .remedy-item, .check-card, and .score-grid block, and enforces the
// CLAUDE.md §14 height budgets:
//
//   - First .remedy-item after a .remedy-divider: soft budget 640 px
//   - Subsequent .remedy-item:                    soft budget 1000 px
//   - Any single block:                           hard limit 1056 px (1 page)
//
// Soft-budget violations print a warning but do not fail the build.
// Hard-limit violations (block > 1 page) exit with code 1 so the author
// must split into Part A / Part B before regenerating the PDF.
//
// Usage:
//   node scripts/check-pagination.mjs <html-path>
//
// Auto-invoked from scripts/fill-template.mjs after the HTML is written.

import puppeteer from 'puppeteer-core';
import { existsSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { pathToFileURL } from 'url';
import { resolve, join } from 'path';

const PAGE_H = 1056;           // US Letter at 96 dpi
const BUDGET_FIRST_CARD = 640; // first .remedy-item after a .remedy-divider
const BUDGET_OTHER_CARD = 1000;// subsequent .remedy-item and .check-card

function resolveEdgePath() {
  if (process.platform === 'win32') {
    const edgePaths = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ];
    const found = edgePaths.find(p => existsSync(p));
    if (!found) throw new Error('Microsoft Edge not found.');
    return found;
  }
  const chromiumPaths = [
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
    '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome',
  ];
  const found = chromiumPaths.find(p => existsSync(p));
  if (!found) throw new Error('Chromium not found. Run: sudo apt-get install -y chromium');
  return found;
}

export async function checkPagination(htmlPath) {
  const executablePath = resolveEdgePath();
  const userDataDir = mkdtempSync(join(tmpdir(), 'audit-check-'));
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    userDataDir,
    args: ['--no-first-run', '--no-default-browser-check', '--disable-extensions'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 816, height: PAGE_H });
    await page.emulateMediaType('print');
    await page.goto(pathToFileURL(resolve(htmlPath)).href, { waitUntil: 'networkidle0', timeout: 30000 });

    const measured = await page.evaluate(() => {
      const out = { blocks: [], heads: [], codeLines: [] };
      const collect = (selector, type, titleSelector) => {
        document.querySelectorAll(selector).forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const titleEl = titleSelector ? el.querySelector(titleSelector) : null;
          const numEl = el.querySelector('.remedy-item-num');
          const title = (titleEl?.innerText || '').trim().slice(0, 100);
          const num = (numEl?.innerText || '').trim();
          // Cards with .has-standalone are allowed to flow across page boundaries
          // (each source line of code is its own .code-line block).
          const hasStandalone = el.classList.contains('has-standalone');
          // Was this remedy-item the first child after a .remedy-divider?
          let prevDivider = false;
          if (type === 'remedy-item') {
            let prev = el.previousElementSibling;
            while (prev && prev.nodeType !== 1) prev = prev.previousElementSibling;
            prevDivider = !!(prev && prev.classList.contains('remedy-divider'));
          }
          out.blocks.push({
            type, index: idx,
            height: Math.round(rect.height),
            top: Math.round(rect.top),
            title, num, prevDivider, hasStandalone,
          });
        });
      };
      collect('.remedy-item',  'remedy-item', '.remedy-item-title');
      collect('.check-card',   'check-card',  '.check-name');
      collect('.score-grid',   'score-grid',  null);

      // T1c: per-card .remedy-item-head positioning for orphan-head detection.
      document.querySelectorAll('.remedy-item-head').forEach(head => {
        const rect = head.getBoundingClientRect();
        const parent = head.closest('.remedy-item');
        const num = parent?.querySelector('.remedy-item-num')?.innerText.trim() || '';
        const title = parent?.querySelector('.remedy-item-title')?.innerText.trim().slice(0, 100) || '';
        out.heads.push({
          top: Math.round(rect.top),
          height: Math.round(rect.height),
          bottom: Math.round(rect.top + rect.height),
          num, title,
        });
      });

      // T1c: per-line .code-line height for long-code-line detection.
      // Group by parent <pre.standalone-code> so warnings tie to a specific card.
      document.querySelectorAll('pre.standalone-code').forEach(pre => {
        const parent = pre.closest('.remedy-item');
        const num = parent?.querySelector('.remedy-item-num')?.innerText.trim() || '';
        const title = parent?.querySelector('.remedy-item-title')?.innerText.trim().slice(0, 100) || '';
        const lines = pre.querySelectorAll('.code-line');
        lines.forEach((line, idx) => {
          const h = Math.round(line.getBoundingClientRect().height);
          out.codeLines.push({ num, title, lineIndex: idx + 1, height: h, snippet: (line.innerText || '').trim().slice(0, 60) });
        });
      });

      return out;
    });

    const blocks = measured.blocks;
    const softWarnings = [];
    const hardFailures = [];

    for (const b of blocks) {
      const label = b.type === 'remedy-item'
        ? `${b.num || `remedy-item #${b.index + 1}`}: ${b.title}`
        : b.type === 'check-card'
          ? `check-card: ${b.title}`
          : 'score-grid';

      // Cards with a large standalone code block are expected to span pages by design.
      // Surface their height as a soft warning so the author still sees it, but
      // never hard-fail on them; the print CSS lets each .code-line break safely.
      if (b.hasStandalone) {
        if (b.height > PAGE_H) {
          softWarnings.push({ label, height: b.height, budget: PAGE_H, kind: 'has-standalone (flows across pages)' });
        }
        continue;
      }

      if (b.height > PAGE_H) {
        hardFailures.push({ label, height: b.height, type: b.type });
        continue;
      }
      if (b.type === 'remedy-item' && b.prevDivider && b.height > BUDGET_FIRST_CARD) {
        softWarnings.push({ label, height: b.height, budget: BUDGET_FIRST_CARD, kind: 'first-card-after-divider' });
        continue;
      }
      if (b.type === 'remedy-item' && !b.prevDivider && b.height > BUDGET_OTHER_CARD) {
        softWarnings.push({ label, height: b.height, budget: BUDGET_OTHER_CARD, kind: 'remedy-item' });
        continue;
      }
      if (b.type === 'check-card' && b.height > BUDGET_OTHER_CARD) {
        softWarnings.push({ label, height: b.height, budget: BUDGET_OTHER_CARD, kind: 'check-card' });
      }
    }

    // T1c rule 1: orphan-head detection. If a card's .remedy-item-head bottom edge
    // falls in the last 100px of a page (i.e. bottom % PAGE_H > PAGE_H - 100), the
    // head is in the page-boundary danger zone. With the .remedy-item-head
    // break-inside: avoid rule the renderer will push it to the next page, but
    // flowing (has-standalone) cards may still split if the rest is small enough.
    for (const h of measured.heads) {
      const bottomOnPage = h.bottom % PAGE_H;
      if (bottomOnPage > PAGE_H - 100 && bottomOnPage < PAGE_H) {
        const pageNum = Math.floor(h.bottom / PAGE_H) + 1;
        softWarnings.push({
          label: `${h.num || 'card head'}: ${h.title}`,
          height: h.height,
          budget: PAGE_H - 100,
          kind: 'card-head-near-page-bottom',
          pageNum,
          bottomOnPage,
        });
      }
    }

    // T1c rule 2: long-code-line detection. A single .code-line taller than 80px has
    // soft-wrapped to 3+ visual lines (line-height ~20px). If it falls near a page
    // boundary it can wrap awkwardly. Warn so the author can shorten the source line.
    for (const cl of measured.codeLines) {
      if (cl.height > 80) {
        softWarnings.push({
          label: `${cl.num || 'standalone code'}: line ${cl.lineIndex}`,
          height: cl.height,
          budget: 80,
          kind: 'long-code-line',
          snippet: cl.snippet,
        });
      }
    }

    return { blocks, softWarnings, hardFailures, heads: measured.heads, codeLines: measured.codeLines };
  } finally {
    await browser.close();
  }
}

export function report({ blocks, softWarnings, hardFailures }) {
  console.log(`\nPagination check: ${blocks.length} blocks measured (${blocks.filter(b => b.type === 'remedy-item').length} remedy-items, ${blocks.filter(b => b.type === 'check-card').length} check-cards).`);

  for (const w of softWarnings) {
    if (w.kind === 'card-head-near-page-bottom') {
      console.log(`⚠ Card head near page bottom (${w.bottomOnPage}px into page ${w.pageNum}, last ${PAGE_H - w.bottomOnPage}px): ${w.label}`);
      console.log(`  Note: the tag + title + Audit Findings of this card sit at the very bottom of a page. .remedy-item-head { break-inside: avoid } should push it to the next page, but flowing (has-standalone) cards remain at risk. Consider shortening the preceding content.`);
      continue;
    }
    if (w.kind === 'long-code-line') {
      console.log(`⚠ Long code line wraps to multiple visual lines (${w.height}px tall, ~${Math.round(w.height / 20)} visual lines): ${w.label}`);
      if (w.snippet) console.log(`  Line preview: ${w.snippet}${w.snippet.length >= 60 ? '…' : ''}`);
      console.log(`  Note: the source line is long enough to soft-wrap several times. Consider breaking the JSON line at a comma so each visual line fits without wrapping near a page boundary.`);
      continue;
    }
    console.log(`⚠ Over soft budget (${w.kind} ${w.budget}px): ${w.height}px — ${w.label}`);
    if (w.kind === 'first-card-after-divider') {
      console.log(`  Note: a first card over ${w.budget}px is pushed off its section-header page, leaving a near-blank navy page above the divider. Split into Part A / Part B (CLAUDE.md §14) to keep the header, intro, divider, and first card on one page.`);
    }
  }
  for (const f of hardFailures) {
    console.log(`✗ EXCEEDS PAGE (${PAGE_H}px hard limit): ${f.height}px — ${f.label}`);
    console.log(`  Action: split this card into "Part A" / "Part B" in the JSON, see CLAUDE.md §14.`);
  }

  console.log(`Summary: ${softWarnings.length} soft warning(s), ${hardFailures.length} hard failure(s).`);
}

// CLI entrypoint
const isDirectInvoke = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectInvoke) {
  const inputArg = process.argv[2];
  if (!inputArg) {
    console.error('Usage: node scripts/check-pagination.mjs <html-path>');
    process.exit(1);
  }
  if (!existsSync(resolve(inputArg))) {
    console.error(`HTML not found: ${resolve(inputArg)}`);
    process.exit(1);
  }
  const result = await checkPagination(inputArg);
  report(result);
  process.exit(result.hardFailures.length > 0 ? 1 : 0);
}
