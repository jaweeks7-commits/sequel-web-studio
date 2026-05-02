# Pro Diagnosis + Remedy Package — Repeatable Product Process

> **Purpose of this document:** Living reference for producing the "Pro Diagnosis + Remedy Package" for any client. Read this at the start of every session. Update it whenever a process step changes or a new decision is made.

---

## What This Product Is

A paid deliverable ($350 — may be repriced) that gives a small-business website owner:

1. A scored audit of their website across 50 checks (28 standard + 22 additional diagnostics)
2. A Priority Action List of the 10 highest-impact problems
3. Step-by-step fix instructions for every Priority Action item (the "Remedy Package"), including ready-to-copy code blocks where applicable
4. A complete record of all 50 findings for reference

Delivered as a single PDF. Produced by running one terminal command against a pre-built HTML source file.

---

## Current State (as of May 1, 2026)

### What is complete
- **BSR Bike Shop audit report** — fully built HTML source and generated PDF
  - HTML source: `bsr-bikeshop-pro-diagnosis-april-2026.html` (project root)
  - PDF output: `BSR-Bike-Shop-Remedy-Package-April-2026.pdf` (project root)
  - PDF generation script: `scripts/generate-audit-pdf.mjs`
  - To regenerate: `npm run generate-audit-pdf`
- **Document structure locked** — the BSR report defines the standard structure for all future reports (see Section 4 below)
- **PDF generator working** — uses Puppeteer + system Edge, preserves all CSS formatting, all text is selectable/copyable including code blocks

### What is NOT yet built (next priorities — see Section 6)
- Reusable HTML template (blank, client data replaced with placeholders)
- Data collection worksheet / intake sheet
- Script that accepts a client filename argument (currently hardcoded to BSR)
- Formal QA checklist

---

## Section 1: The Standard Document Structure

Every report must follow this exact order. Do not deviate without updating this document.

| # | Section | Notes |
|---|---|---|
| 1 | Cover / Title Page | Client name, site URL, date, platform, total checks |
| 2 | Executive Summary | Score grid only (Critical / High Value / Pass / Nice to Have counts) + 1–2 sentence overview |
| 3 | What's Included | Four cards: Priority Action List, Remedy Package, Audit Results, Standalone Deliverables |
| 4 | Priority Action List | 10 items ranked by impact, on its own page |
| 5 | Remedy Package | 10 items, Criticals first then High Values. Each item: badge + title → Audit Findings → Remedy Steps |
| 6 | Audit Results | All 50 checks across 9 categories. Items covered in Remedy Package show a cross-reference note |
| 7 | Footer | "Pro Diagnosis + Remedy Package prepared by Sequel Web Studio · sequelwebstudio.com" + date |

### Remedy Package item structure (repeat for each of the 10 items)
```
[Critical / High Value badge]  ·  Item N of 10
[Item title]

AUDIT FINDINGS
  [What was found on this client's site — specific, factual]

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

### Additional Diagnostics (B01–B22)
These are found during the live audit session — not all will apply to every client.

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

> **Note:** The B-checks are a discovery list, not a fixed checklist. Add new B-numbers for issues found that don't fit the standard 28. The BSR report went to B22. Each new client may surface different additional issues.

---

## Section 3: The Four-Phase Production Process

### Phase 1 — Client Data Collection (Live Audit Session)

**Goal:** Run all applicable checks against the client's live website and record raw findings.

**How to run the audit:**
- Use a real browser session (not an automated tool) — Playwright MCP or manual browser
- Check each of the 28 standard items in category order
- Add B-numbered checks for anything found outside the standard 28
- For each check, record: (a) Pass / Fail / Warning / Nice to Have, (b) Exactly what was found, (c) Why it matters in plain English

**Tools used in BSR audit:**
- Playwright MCP browser (live session) for visual + source inspection
- Google PageSpeed Insights for performance data
- Google Rich Results Test for schema validation
- Manual source view for GA4 tag inspection, canonical tags, robots meta

**STATUS:** Process works but is not yet documented as a step-by-step checklist. Using BSR as the reference model.

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
3. Run `node scripts/fill-template.mjs [client]-audit-data-[month]-[year].json`
   → outputs `[client]-pro-diagnosis-[month]-[year].html` automatically
4. Run `node scripts/generate-audit-pdf.mjs [client]-pro-diagnosis-[month]-[year].html`
   → outputs `[Client]-Remedy-Package-[Month]-[Year].pdf`
5. Open the PDF and visually verify formatting (see Phase 4 QA checklist)

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
- [ ] Executive Summary score grid: Critical / High Value / Pass / Nice to Have counts are correct
- [ ] Priority Action List: exactly 10 items, ordered Critical first then High Value
- [ ] Remedy Package: exactly 10 items matching the Priority Action List, in the same order
- [ ] Each Remedy item has: badge, item number, title, Audit Findings, and Remedy steps
- [ ] Audit Results: all 50 checks present and accounted for
- [ ] Cross-references: every check in the Remedy Package shows "See Remedy Package — Item X" in Audit Results
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
| `scripts/fill-template.mjs` | **Step 2 in the pipeline.** Reads client JSON → fills HTML template → outputs `[client]-pro-diagnosis-[month]-[year].html`. Usage: `node scripts/fill-template.mjs [client]-audit-data-[month]-[year].json` |
| `scripts/generate-audit-pdf.mjs` | **Step 3 in the pipeline.** Reads HTML → generates PDF. Usage: `node scripts/generate-audit-pdf.mjs [client]-pro-diagnosis-[month]-[year].html` |
| `bsr-bikeshop-pro-diagnosis-april-2026.html` | BSR Bike Shop audit report — completed reference copy (built before data pipeline existed). |
| `BSR-Bike-Shop-Remedy-Package-April-2026.pdf` | Generated client deliverable for BSR. |
| `scripts/generate-audit-docx.mjs` | Older DOCX script — superseded, kept for reference. |
| `package.json` | `npm run fill-audit-template` and `npm run generate-audit-pdf` npm aliases. |

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

---

## Section 5: Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Deliverable format | PDF (not Word .docx) | Full CSS formatting preserved; all text including code is selectable/copyable in PDF |
| PDF generator | Puppeteer + system Edge | No extra browser download; uses the same browser Joe views the HTML in |
| Document name | "Pro Diagnosis + Remedy Package" | Replaced "Pro Diagnosis + Upgrade Package" — "Remedy" is more descriptive |
| Remedy Package scope | Exactly 10 items (Priority Action List only) | Clear scope; clients know exactly what they're getting |
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
- **Turnaround:** Not yet formally committed; BSR was delivered ~1 week after engagement
- **What the client receives:** Single PDF file (the Pro Diagnosis + Remedy Package)
- **Upsell:** Post-audit implementation help ("Sequel Web Studio can implement any or all of these items")
