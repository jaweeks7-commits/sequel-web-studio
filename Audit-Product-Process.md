# Pro Diagnosis + Remedy Package — Repeatable Product Process

> **Purpose of this document:** Living reference for producing the "Pro Diagnosis + Remedy Package" for any client. Read this at the start of every session. Update it whenever a process step changes or a new decision is made.

---

> **⚠ NON-NEGOTIABLE RULE — READ BEFORE EVERY AUDIT:**
> The Priority Action List and Remedy Package must include **ALL Critical findings** and **ALL High Value findings** found in the audit — regardless of how many there are. There is no cap of 10 or any other number. If the audit finds 9 Criticals and 15 High Values, the deliverable contains 24 (or fewer if some share a remedy) priority items and 24 remedy items. Two findings may share one remedy item only when the fix steps are literally the same action. **If any Critical or High Value check has `remedyItem: null` in the JSON, that is a production error that must be fixed before delivery.** When a shared remedy item covers two or more findings, `fill-template.mjs` automatically renders a "This remedy addresses N audit findings" disclosure note below the item title in the final PDF — no manual action needed, but verify it rendered during QA.

---

## What This Product Is

A paid deliverable ($350 — may be repriced) that gives a small-business website owner:

1. A scored audit of their website: 28 standard checks + all applicable B-check diagnostics (typically 22 or more, including whatever the Exploration Pass surfaces)
2. A Priority Action List containing **every** Critical and High Value finding (no cap — see the non-negotiable rule above)
3. Step-by-step fix instructions for every Priority Action item (the "Remedy Package"), including ready-to-copy code blocks where applicable
4. A complete record of all findings for reference

Delivered as a single PDF. Produced by running one terminal command against the audit data JSON.

---

## Current State (as of June 2026)

The full pipeline is built and in production — see Section 6 for the completion log. The reusable template, intake sheet, session guide, QA checklist, data schema, pagination pre-flight check, and post-PDF QC all exist:

- Session guide: `templates/audit-session-guide.md` (Claude reads this at the start of every audit session)
- Intake sheet: `templates/audit-intake-sheet-template.md`
- Data schema: `templates/audit-data-schema.json`
- HTML template: `templates/audit-report-template.html`
- Build: `node scripts/fill-template.mjs <data>.json --pdf` (fills template, runs pagination pre-flight, chains to PDF generation)
- QA checklist: `templates/audit-qa-checklist.html`
- Archive/cleanup: `node scripts/archive-audit.mjs <data>.json`

---

## Section 1: The Standard Document Structure

Every report must follow this exact order. Do not deviate without updating this document.

| # | Section | Notes |
|---|---|---|
| 1 | Cover / Title Page | Client name, site URL, date, platform, total checks |
| 2 | Executive Summary | Score grid only (Critical / High Value / Pass / Nice to Have counts) + 1–2 sentence overview |
| 3 | What's Included | Four cards: Priority Action List, Remedy Package, Audit Results, Standalone Deliverables |
| 4 | Priority Action List | All Critical + High Value items ranked by impact, on its own page |
| 5 | Remedy Package | One remedy per Critical and High Value item, Criticals first then High Values. Each item: badge + title → Audit Findings → Remedy Steps |
| 6 | Audit Results | All checks (28 standard across 8 categories + the B-check diagnostics section). Items covered in Remedy Package show a cross-reference note |
| 7 | Footer | "Pro Diagnosis + Remedy Package prepared by Sequel Web Studio · sequelwebstudio.com" + date |

### Remedy Package item structure (repeat for each item)
```
[Critical / High Value badge]  ·  Item N
[Item title]
[Auto-generated if item covers multiple checks:
  "This remedy addresses N audit findings: [check names] — see Audit Results for individual findings."]

AUDIT FINDINGS
  [What was found on this client's site — specific, factual; if covering multiple checks, address all of them]

REMEDY — STEP BY STEP
  Step 1: [Exact platform path + action, written so a non-technical person can follow]
  Step 2: ...
  [Code block if applicable, with "Standalone Deliverable" callout]
```

---

## Section 2: The 50-Check Audit Framework

### Standard 28 Checks (8 Categories)

**Category 01 — SEO Fundamentals (6 checks)**
1. Page Title Tag
2. Meta Description
3. Canonical Tag
4. Robots Meta Tag
5. Heading Structure (H1/H2/H3 hierarchy)
6. Inner Page Canonicals

**Category 02 — Social Sharing & Open Graph (3 checks)**
7. OG Image
8. Open Graph Tags (og:title, og:description, og:url, og:type)
9. Twitter Cards

**Category 03 — Performance & Page Speed (5 checks)**
10. TTFB (Time to First Byte)
11. Total Load Time
12. Image Optimization
13. Third-Party Services Impact
14. Script Loading (JavaScript render-blocking)

**Category 04 — Schema & Structured Data (3 checks)**
15. Structured Data Presence (LocalBusiness, WebSite, etc.)
16. Schema Connectivity (blocks linked via @id)
17. Rich Result Types available but missing

**Category 05 — Analytics & Tracking Integrity (3 checks)**
18. GA4 / Analytics present
19. Duplicate Pixel Firing (same tag loaded twice)
20. Third-Party Inventory (what scripts are running)

**Category 06 — Security & Crawlability (4 checks)**
21. Robots.txt (what's blocked)
22. HTTPS / SSL
23. External Link noopener attribute
24. llms.txt (AI discoverability file)

**Category 07 — Accessibility (2 checks)**
25. Image Alt Text
26. HTML Lang Attribute

**Category 08 — Platform & AI Discoverability (2 checks)**
27. Website Builder / Platform identification
28. AI-Powered Search readiness

### Additional Diagnostics (B-checks)
Found during the live audit session: the reference table (B01–B22), the AI checks (B_AI1–B_AI2), the accessibility checks (B_A11Y1–B_A11Y4), and Exploration Pass discoveries (B23+).

- B01 · Mobile Viewport Meta Tag
- B02 · Mobile Layout issues (e.g. widget overlap)
- B03 · HTTP → HTTPS Redirect
- B04 · Non-www to www Redirect
- B05 · 404 Error Page Quality
- B06 · Sitemap accuracy (homepage URL, draft pages)
- B07 · Duplicate / Draft Pages in Sitemap
- B08 · Cookie Consent / GDPR Compliance
- B09 · Privacy Policy — exists but not linked
- B10 · Physical Address on Homepage (NAP Consistency)
- B11 · Phone Number Format
- B12 · Social Media Completeness
- B13 · Contact Page — No Embedded Map
- B14 · Contact Page — No Web Form
- B15 · Inner Page Title quality / length issues
- B16 · Missing page-specific schema (e.g. FAQPage)
- B17 · Mixed content (HTTP links on HTTPS page)
- B18 · Developer artifacts left in source
- B19 · Favicon formats (modern formats missing)
- B20 · Copyright Notice in Footer
- B21 · Video Content presence
- B22 · hreflang Tags (international/multilingual)
- B_AI1 · sameAs Authority Links (verified directory listings)
- B_AI2 · FAQPage Schema from site FAQ content
- B_A11Y1 · Form Input Labels
- B_A11Y2 · Keyboard Focus Visibility
- B_A11Y3 · Color Contrast spot-check
- B_A11Y4 · Link Text Quality

> **Note:** This list is a floor, not a ceiling. Run every listed B-check unless it is structurally inapplicable to the site (and note why when skipping). The mandatory **Exploration Pass** (see `templates/audit-session-guide.md`) is the source of new B-numbers: every noteworthy observation from browsing the site like a customer gets the next free number (B23+). Each new client may surface different additional issues.

---

## Section 3: The Four-Phase Production Process

### Phase 1 — Client Data Collection (Live Audit Session)

**Goal:** Run all applicable checks against the client's live website and record raw findings.

**How to run the audit:**
- Use a real browser session (not an automated tool) — Playwright MCP or manual browser
- Check each of the 28 standard items in category order
- Run the **mandatory Exploration Pass**: browse 4–5 key pages like a prospective customer, at desktop and 375px mobile widths, and record every noteworthy observation (copy, CTAs, trust signals, broken things, images, UX) as a new B-check — see `templates/audit-session-guide.md` for the full instruction
- Run the B-check diagnostics table (floor, not ceiling — skip only what is structurally inapplicable, and note why)
- For each check, record: (a) Pass / Fail / Warning / Nice to Have, (b) Exactly what was found, (c) Why it matters in plain English

**Tools used in BSR audit:**
- Playwright MCP browser (live session) for visual + source inspection
- Google PageSpeed Insights for performance data
- Google Rich Results Test for schema validation
- Manual source view for GA4 tag inspection, canonical tags, robots meta

**STATUS:** Fully documented — `templates/audit-session-guide.md` is the step-by-step checklist Claude reads at the start of every audit session.

---

### Phase 2 — Raw Data Documentation (Intake Sheet)

**Goal:** Record all findings in a structured format that can be referenced when building the HTML deliverable — without needing to re-visit the client site.

**What to capture per check:**
- Check name and category
- Badge: Critical / High Value / Pass / Nice to Have
- Found: exact observation (e.g. "GA4 ID G-XXXXXXXX appears twice — once in Squarespace Analytics settings and once in Code Injection header")
- Business Impact: why this matters to the client
- Technical detail (if applicable): code snippet, URL, tag contents
- Remedy: the fix steps (for items going into the Remedy Package)

**STATUS: NOT YET BUILT.** This is the highest-priority next step. Need to create a structured intake sheet — likely a Google Doc template or a simple structured text format. The current process has Claude running the audit and directly writing the HTML, which works but is hard to review or hand off.

---

### Phase 3 — Building the HTML Deliverable

**Goal:** Produce the styled HTML source file that gets converted to PDF.

**Current process (data-driven pipeline):**
1. Review the completed intake sheet — confirm priority/remedy items are correct
2. Claude produces `[client]-audit-data-[month]-[year].json` from the intake sheet findings
3. Run `node scripts/fill-template.mjs [client]-audit-data-[month]-[year].json --pdf`
   → outputs `[client]-pro-diagnosis-[month]-[year].html`, runs the pagination pre-flight check, then chains automatically to `generate-audit-pdf.mjs`
   → outputs `[Client]-Remedy-Package-[Month]-[Year].pdf`
   (Omit `--pdf` to stop after the HTML; fill-template prints the PDF command to run next. The pagination check still gates the chain — a hard failure aborts before any PDF is produced.)
4. Open the PDF and visually verify formatting (see Phase 4 QA checklist)
5. After delivery: run `node scripts/archive-audit.mjs [client]-audit-data-[month]-[year].json` to sweep session artifacts into the archive and verify `audit-tool/` and the repo root are clean

**Why this is efficient:** Claude only outputs structured JSON (~2,000–4,000 tokens). The script handles all HTML assembly at zero token cost. Priority and remedy item counts are variable — the script loops over however many items are in the JSON arrays.

**File naming convention:**
- HTML source: `[client-slug]-pro-diagnosis-[month]-[year].html`
  - Example: `bsr-bikeshop-pro-diagnosis-april-2026.html`
- PDF output: `[Client-Name]-Remedy-Package-[Month]-[Year].pdf`
  - Example: `BSR-Bike-Shop-Remedy-Package-April-2026.pdf`

**STATUS:** Works for BSR. Script currently hardcoded to BSR filename. Template not yet extracted from BSR source. See Section 6 for next steps.

---

### Phase 4 — Quality Check Before Handoff

**Goal:** Confirm everything is correct before sending to the client.

**Checklist (formalized version: `templates/audit-qa-checklist.html`):**

**Content completeness:**
- [ ] Cover page: correct client name, site URL, date, platform
- [ ] Executive Summary score grid reconciles with the rest of the document — `fill-template.mjs` now enforces this automatically and exits with code 1 on any mismatch:
  - `scores.critical` must equal the count of `priorityItems` with `badge: "critical"`
  - `scores.highValue` must equal the count of `priorityItems` with `badge: "high"`
  - `scores.pass` must equal the count of Pass entries in `auditChecks` + `bChecks`
  - `scores.niceToHave` must equal the count of Nice to Have entries in `auditChecks` + `bChecks`
  - Rationale: Critical/High Value cards represent *actions* (one per priority item, since several findings may share a single remedy); Pass/Nice cards represent *checks* (one per finding in the detailed table).
- [ ] Priority Action List: ordered Critical first then High Value; item count matches the score grid (validated automatically)
- [ ] Remedy Package: every Priority Action has a matching Remedy item, in the same order
- [ ] Each Remedy item has: badge, item number, title, Audit Findings, Why This Matters (one or two plain-language sentences naming the business consequence), and Remedy steps. On Part A / Part B siblings, each card carries its own independent `whyThisMatters` value.
- [ ] Audit Results: all 28 standard checks plus every B-check present in the data file are rendered
- [ ] Cross-references: every check with a non-null `remedyItem` shows "See Remedy Package — Item X" in Audit Results
- [ ] Standalone Deliverables: flagged in What's Included and with callout boxes in the document
- [ ] Footer: correct date, Sequel Web Studio branding

**Formatting:**
- [ ] Cover page fills page 1 (navy gradient, white text)
- [ ] Priority Action List starts on its own page
- [ ] Remedy Package section has dark navy background with white text
- [ ] Critical badges are red, High Value badges are amber
- [ ] Code blocks are monospace and visually distinct
- [ ] No check card splits awkwardly across a page break

**Code blocks / standalone deliverables:**
- [ ] All JSON-LD code is valid (test at schema.org/SchemaApp or Google Rich Results Test)
- [ ] All code is selectable and copyable in the PDF
- [ ] No HTML entities showing as raw text (no `&lt;` showing instead of `<`)

**Accuracy:**
- [ ] Every finding is accurate to the live site as of the audit date
- [ ] Remedy steps match the client's actual platform (Squarespace, WordPress, etc.)
- [ ] All specific values are correct (GA4 IDs, URLs, image filenames, etc.)

---

## Section 4: Technical Reference

### Files in This Project (audit-related)

| File | What It Does |
|---|---|
| `templates/audit-session-guide.md` | **Open at the start of every audit session.** Step-by-step guide: tools to open, all 28 checks in order with exact source search strings, B-check reference table, platform notes (Squarespace/WP/Wix/Webflow). |
| `templates/audit-qa-checklist.html` | **Run before every delivery.** Printable 25-item QA checklist with sign-off block. Open in browser and print, or use on-screen. |
| `templates/audit-intake-sheet-template.md` | **Fill during the live audit session.** Structured record of all findings; hand to Claude to produce the JSON data file. |
| `templates/audit-data-schema.json` | **JSON format reference.** Documents exactly what Claude must produce at the end of an audit session. Save client output as `[client]-audit-data-[month]-[year].json`. |
| `templates/audit-report-template.html` | **HTML skeleton — do not edit manually.** Contains CSS + structure + block markers. The fill-template script populates it. 302 lines (down from 835). |
| `scripts/fill-template.mjs` | **Step 2 in the pipeline.** Reads client JSON → fills HTML template → outputs `[client]-pro-diagnosis-[month]-[year].html`. With `--pdf` it chains straight to PDF generation after the pagination check passes. Usage: `node scripts/fill-template.mjs [client]-audit-data-[month]-[year].json --pdf` |
| `scripts/generate-audit-pdf.mjs` | **Step 3 in the pipeline** (run automatically by `--pdf`, or manually). Reads HTML → generates PDF. Usage: `node scripts/generate-audit-pdf.mjs [client]-pro-diagnosis-[month]-[year].html` |
| `scripts/archive-audit.mjs` | **Post-delivery cleanup.** Sweeps session artifacts (root JSON/HTML/PDF copies, intake progress file, screenshots) into `C:\Sequel Audit Deliverables\{YYYY-MM}\{client-slug}\` and verifies `audit-tool/` and the repo root are clean. Usage: `node scripts/archive-audit.mjs [client]-audit-data-[month]-[year].json [--dry-run]` |
| `bsr-bikeshop-pro-diagnosis-april-2026.html` | BSR Bike Shop audit report — completed reference copy (built before data pipeline existed). |
| `BSR-Bike-Shop-Remedy-Package-April-2026.pdf` | Generated client deliverable for BSR. |
| `scripts/generate-audit-docx.mjs` | Older DOCX script — superseded, kept for reference. |
| `package.json` | npm aliases: `build-audit` (fill + chained PDF), `archive-audit`, `generate-audit-pdf`. |

### How the PDF Generator Works
- Uses `puppeteer-core` npm package + system Microsoft Edge (no extra browser download needed)
- Opens the HTML file locally in headless Edge
- Sets viewport to 816×1056px (US Letter at 96dpi) so `100vh` = one page height
- Exports with `printBackground: true` so dark backgrounds render
- The HTML's `@media print` CSS handles page breaks between sections

### CSS Classes That Define the Look (do not remove from the HTML)
- `.cover` — navy gradient cover page
- `.remedy-section` — dark navy Remedy Package background
- `.remedy-item` — each remedy card
- `.remedy-finding` — findings block (dark inset)
- `.remedy-step` — individual step line
- `.standalone-callout` — teal callout above code blocks
- `.check-card` — each audit result card (white, rounded)
- `.badge-critical`, `.badge-high`, `.badge-pass`, `.badge-nice` — colored badges
- `.see-remedy-note` — blue left-border cross-reference note
- `.remedy-covers-note` — auto-generated informational note on remedy items that cover multiple checks

---

## Section 5: Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Deliverable format | PDF (not Word .docx) | Full CSS formatting preserved; all text including code is selectable/copyable in PDF |
| PDF generator | Puppeteer + system Edge | No extra browser download; uses the same browser Joe views the HTML in |
| Document name | "Pro Diagnosis + Remedy Package" | Replaced "Pro Diagnosis + Upgrade Package" — "Remedy" is more descriptive |
| Remedy Package scope | All Critical + all High Value items (no cap) | Every finding that matters gets a fix. Prior 10-item cap removed May 2026 — it left high-value findings without remedies. |
| Audit Results cross-referencing | Items in Remedy Package show "See Remedy Package — Item X" | Avoids duplication; keeps document navigable |
| Code delivery | Inline in PDF as copyable code blocks | Client can select and copy directly from the PDF |
| Standalone deliverables | Called out in What's Included + inline callout boxes | Ensures client doesn't miss ready-to-use artifacts |

---

## Section 6: Next Steps (Priority Order)

### ✅ Priority 1 — Make the PDF script accept a client filename argument — DONE (May 2026)
`scripts/generate-audit-pdf.mjs` now requires a filename argument:
```
node scripts/generate-audit-pdf.mjs acme-plumbing-pro-diagnosis-may-2026.html
```
Output PDF name is derived automatically from the input filename (client slug + Remedy-Package + date).

### ✅ Priority 2 — Extract a blank HTML template from the BSR source — DONE (May 2026)
**File:** `templates/audit-report-template.html` — 835-line skeleton with all CSS intact and every BSR-specific value replaced with named `{{PLACEHOLDER}}` tokens. Standard check names (Cat 01–08) are pre-filled; only badge, found, impact, and technical-detail fields need to be filled in per client.

### ✅ Priority 3 — Create a structured data collection intake sheet — DONE (May 2026)
**File:** `templates/audit-intake-sheet-template.md` — 7-section Markdown sheet. Fill during live audit session, hand to Claude for HTML build. All 28 standard checks pre-labeled; variable-count priority/remedy items (no required number); build checklist in Section 7.
**Note:** Priority and remedy item counts are flexible throughout — the HTML template was updated in this session to remove all hardcoded references to "10 items".

### ✅ Priority 4 — Formalize the QA checklist — DONE (May 2026)
**File:** `templates/audit-qa-checklist.html` — printable HTML form with 5 sections (Content Completeness, Formatting, Code Blocks, Accuracy, Final File Check) and a sign-off block. Open in a browser and print, or use on-screen. Item count references updated to be flexible (no hardcoded "10").

### ✅ Priority 5 — Document the audit collection process — DONE (May 2026)
**File:** `templates/audit-session-guide.md` — full session guide covering: pre-session setup, tool list, all 28 standard checks in order (with exact source search strings), B-check reference table, platform-specific notes for Squarespace / WordPress / Wix / Webflow, and a session wrap-up checklist. Ends with the pipeline quick-reference.

---

## Section 7: Pricing & Packaging (current)

- **Price:** $350 (pilot pricing through first ~10 clients — per CLAUDE.md decision log)
- **Turnaround:** 24 hours from purchase. This is the commitment stated on the marketing site (audit.astro, index.astro, AuditForm.astro) and in customer-facing LinkedIn content, so every audit session must be planned to deliver within that window.
- **What the client receives:** Single PDF file (the Pro Diagnosis + Remedy Package)
- **Upsell:** Post-audit implementation help ("Sequel Web Studio can implement any or all of these items")
