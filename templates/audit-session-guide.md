# Live Audit Session Guide
## Pro Diagnosis + Remedy Package — Sequel Web Studio

> **How to use this:** Claude reads this file at the start of every autonomous audit session. Each check specifies the exact Playwright MCP action to run, the pass/fail criteria, the badge to assign, and the JSON key path for recording the finding. Execute checks in order. Record every finding immediately — do not batch.

---

## Pre-Audit Setup

### Step 0 — Verify Playwright MCP and navigate to client site

Run this first. It confirms Playwright is connected and gives you the first visual of the site.

```
playwright_navigate: [CLIENT_URL]
playwright_snapshot
```

If navigation fails or returns an error: stop and report to Joe — Playwright MCP is not connected. Joe must reload the VS Code window (`Ctrl+Shift+P` → Reload Window) and restart the session.

**Also prepare:**
- Note the client slug: lowercase business name, hyphens for spaces (e.g., `bsr-bikeshop`)
- Note the month-year slug: `may-2026` format
- Data file will be saved as: `[client-slug]-audit-data-[month]-[year].json`

---

## Phase 1 — Platform Identification (do this before all other checks)

Platform determines how to interpret nearly every finding and what remedy steps to write. Do this first.

### Check 27 — Website Builder / Platform
**JSON key:** `auditChecks.C08_1`

```js
// playwright_evaluate:
({
  scripts: [...document.querySelectorAll('script[src]')].map(s => s.src).slice(0, 30),
  links:   [...document.querySelectorAll('link[href]')].map(l => l.href).slice(0, 20),
  meta:    [...document.querySelectorAll('meta[name="generator"]')].map(m => m.getAttribute('content')),
})
```

**Identify platform from output:**
- `squarespace.com` in script/CSS URLs → **Squarespace**
- `wp-content/` or `wp-includes/` in URLs → **WordPress**
- `wix.com` or `static.wixstatic.com` → **Wix**
- `webflow.io` or `webflow.com` → **Webflow**
- `shopify.com` in URLs → **Shopify**
- None of the above → Custom/Unknown — note any framework hints

**Badge:** Always Pass (informational)

**Record:**
```json
"C08_1": {
  "badgeClass": "pass",
  "badgeLabel": "Pass",
  "found": "[Platform name] — identified from [source URL fragment]",
  "impact": "Knowing the platform ensures remedy steps are platform-specific and actionable.",
  "technical": "[specific URL or generator meta tag that confirmed it]"
}
```

---

## Category 01 — SEO Fundamentals

### Check 1 — Page Title Tag
**JSON key:** `auditChecks.C01_1`

```js
// playwright_evaluate:
({
  title:  document.title,
  length: document.title.length,
})
```

**Badge assignment:**
- **Pass:** 50–60 characters, includes business name or primary service keyword
- **High Value (high):** Exists but wrong length (under 30 or over 70 chars), generic CMS default ("Home | Untitled Site"), no keyword
- **Critical:** Missing entirely (`""` or `null`)

**Record:** exact title text, character count, badge

---

### Check 2 — Meta Description
**JSON key:** `auditChecks.C01_2`

```js
// playwright_evaluate:
({
  content: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
  length:  (document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '').length,
})
```

**Badge assignment:**
- **Pass:** 120–160 characters, plain English, includes a soft CTA or value statement
- **High Value:** Exists but under 70 chars, over 200 chars, duplicate of title, no CTA
- **Critical:** Missing entirely

**Record:** exact content value, character count, badge

---

### Check 3 — Canonical Tag
**JSON key:** `auditChecks.C01_3`

```js
// playwright_evaluate:
document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null
```

**Badge assignment:**
- **Pass:** Present, points to the page's own preferred URL (https://)
- **High Value:** Missing on homepage, points to http:// on an https:// site, wrong URL
- **Critical:** Points to a different page (e.g., all pages canonicalize to homepage)

**Record:** exact href value or "missing", badge

---

### Check 4 — Robots Meta Tag
**JSON key:** `auditChecks.C01_4`

```js
// playwright_evaluate:
document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? 'absent (defaults to index, follow)'
```

**Badge assignment:**
- **Pass:** `index, follow` or absent (absence = follow by default)
- **Critical:** Contains `noindex` on a page that should be indexed

**Record:** exact content value or "absent", badge

---

### Check 5 — Heading Structure
**JSON key:** `auditChecks.C01_5`

```js
// playwright_evaluate:
[...document.querySelectorAll('h1, h2, h3')].map(h => ({
  tag:  h.tagName,
  text: h.textContent.trim().substring(0, 80),
}))
```

**Badge assignment:**
- **Pass:** Exactly one `<h1>`, logical h2/h3 hierarchy, headings describe content
- **High Value:** Multiple `<h1>` tags, no `<h1>` at all, `<h3>` appears before any `<h2>`, headings used for styling
- **Critical:** Zero headings on a content-heavy homepage

**Record:** the `<h1>` text, count of h1 tags, any hierarchy issues, badge

---

### Check 6 — Inner Page Canonicals
**JSON key:** `auditChecks.C01_6`

Navigate to 2–3 inner pages (Services, About, Contact) and repeat the canonical check:
```js
// playwright_evaluate (run on each inner page):
({ url: window.location.href, canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null })
```

**Badge assignment:**
- **Pass:** Each inner page has its own canonical pointing to itself
- **High Value:** All inner pages canonical back to homepage, or canonicals missing on inner pages

**Record:** pages checked, findings per page, badge

---

## Category 02 — Social Sharing & Open Graph

### Check 7 — OG Image
**JSON key:** `auditChecks.C02_1`

```js
// playwright_evaluate:
({
  ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? null,
})
```

**Badge assignment:**
- **Pass:** Absolute https:// URL present, image is accessible (1200×630 ideal)
- **High Value:** Present but relative URL, wrong dimensions, or generic/unbranded image
- **Critical:** Missing entirely (link previews show no image on social share)

**Record:** URL value or "missing", badge

---

### Check 8 — Open Graph Tags
**JSON key:** `auditChecks.C02_2`

```js
// playwright_evaluate:
['og:title','og:description','og:url','og:type'].reduce((acc, p) => {
  acc[p] = document.querySelector(`meta[property="${p}"]`)?.getAttribute('content') ?? null;
  return acc;
}, {})
```

**Badge assignment:**
- **Pass:** All four present with appropriate values
- **High Value:** One or two missing, or `og:url` doesn't match canonical
- **Critical:** All OG tags missing (social sharing completely unbranded)

**Record:** which are present/missing, any mismatched values, badge

---

### Check 9 — Twitter / X Cards
**JSON key:** `auditChecks.C02_3`

```js
// playwright_evaluate:
['twitter:card','twitter:title','twitter:description','twitter:image'].reduce((acc, p) => {
  acc[p] = document.querySelector(`meta[name="${p}"]`)?.getAttribute('content') ?? null;
  return acc;
}, {})
```

**Badge assignment:**
- **Pass:** `twitter:card` present (at minimum)
- **Nice to Have:** Completely missing (acceptable — Twitter/X falls back to OG tags, but explicit cards look better)

**Record:** which are present/missing, badge

---

## Category 03 — Performance & Page Speed

Run PageSpeed Insights on the mobile tab. Navigate to:
```
https://pagespeed.web.dev/analysis?url=[ENCODED_CLIENT_URL]
```
Take a snapshot. While it loads, continue with other checks and return to read the results.

> **Shortcut for evaluation:** Use `playwright_evaluate` on the PageSpeed results page or take a screenshot to capture the score and diagnostics sections.

### Check 10 — TTFB (Time to First Byte)
**JSON key:** `auditChecks.C03_1`

Look for "Reduce initial server response time" in PageSpeed diagnostics. Also:
```js
// playwright_evaluate (on client site after navigation):
performance.getEntriesByType('navigation')[0]?.responseStart?.toFixed(0) + 'ms'
```

**Badge assignment:**
- **Pass:** Under 600ms
- **High Value:** 600–1500ms
- **Critical:** Over 1500ms (over 2000ms = Critical)

**Record:** actual ms value, badge

---

### Check 11 — Largest Contentful Paint (LCP)
**JSON key:** `auditChecks.C03_2`

Look for the LCP metric in PageSpeed results (mobile tab). Also capture what the LCP element is.

**Badge assignment:**
- **Pass:** Under 2.5s
- **High Value:** 2.5s–4.0s
- **Critical:** Over 4.0s

**Record:** actual LCP value, LCP element description, badge

---

### Check 12 — Image Optimization
**JSON key:** `auditChecks.C03_3`

Look for "Properly size images", "Serve images in next-gen formats", "Efficiently encode images" in PageSpeed diagnostics. Also:
```js
// playwright_evaluate:
[...document.querySelectorAll('img')].map(img => ({
  src:    img.currentSrc?.split('/').pop()?.substring(0, 50),
  format: img.currentSrc?.split('.').pop()?.split('?')[0],
  width:  img.naturalWidth,
  height: img.naturalHeight,
})).slice(0, 10)
```

**Badge assignment:**
- **Pass:** All images WebP/AVIF, sized appropriately, no oversized images flagged
- **High Value:** JPEG/PNG images, PageSpeed shows savings under 200 KiB
- **Critical:** PageSpeed shows savings over 200 KiB, or images clearly oversized

**Record:** formats found, estimated savings from PageSpeed, badge

---

### Check 13 — Third-Party Script Impact
**JSON key:** `auditChecks.C03_4`

Look for "Reduce the impact of third-party code" in PageSpeed diagnostics.

**Badge assignment:**
- **Pass:** No third-party blocking time, or under 250ms total
- **High Value:** 250–500ms blocking time, identifiable scripts causing it
- **Critical:** Over 500ms blocking time from third-party scripts

**Record:** which third-party scripts are present and their total blocking time, badge

---

### Check 14 — Render-Blocking Scripts
**JSON key:** `auditChecks.C03_5`

Look for "Eliminate render-blocking resources" in PageSpeed. Also:
```js
// playwright_evaluate:
[...document.querySelectorAll('head script[src]')].map(s => ({
  src:   s.src?.split('/').pop()?.substring(0, 60),
  async: s.async,
  defer: s.defer,
})).filter(s => !s.async && !s.defer)
```

**Badge assignment:**
- **Pass:** No render-blocking scripts, or PageSpeed doesn't flag this
- **High Value:** One or two render-blocking scripts with modest savings
- **Critical:** Multiple render-blocking scripts with PageSpeed savings over 1s

**Record:** which scripts are blocking, estimated savings, badge

---

## Category 04 — Schema & Structured Data

### Check 15 — Structured Data Presence
**JSON key:** `auditChecks.C04_1`

```js
// playwright_evaluate:
[...document.querySelectorAll('script[type="application/ld+json"]')].map(s => {
  try { return JSON.parse(s.textContent); } catch { return 'parse error'; }
})
```

**Badge assignment:**
- **Pass:** At least LocalBusiness and WebSite schema present with complete data
- **High Value:** Structured data present but minimal (WebSite only, no LocalBusiness)
- **Critical:** No structured data whatsoever

**Record:** all `@type` values found, any parse errors, badge

---

### Check 16 — Schema Connectivity
**JSON key:** `auditChecks.C04_2`

Inspect the JSON-LD blocks from Check 15 for `@id` properties and `sameAs` arrays.

**Badge assignment:**
- **Pass:** Blocks linked via `@id`, `sameAs` points to Google Business Profile and social profiles
- **High Value:** Schema present but isolated — no `@id` links, no `sameAs` connections
- **Nice to Have:** `sameAs` present but incomplete (e.g., missing Google Business Profile)

**Record:** what `@id` and `sameAs` values are present, badge

---

### Check 17 — Rich Result Eligibility
**JSON key:** `auditChecks.C04_3`

Navigate to:
```
https://search.google.com/test/rich-results?url=[ENCODED_CLIENT_URL]
```
Take a snapshot of the results.

**Badge assignment:**
- **Pass:** Rich results detected (FAQPage, LocalBusiness rich result, etc.)
- **High Value:** Eligible for rich results (e.g., FAQ content exists on page but no FAQPage schema)
- **Nice to Have:** Not eligible for rich results given current content type

**Record:** which rich results are detected vs. eligible-but-missing, badge

---

## Category 05 — Analytics & Tracking Integrity

### Check 18 — GA4 / Analytics Present
**JSON key:** `auditChecks.C05_1`

```js
// playwright_evaluate:
{
  gtagIds: [...(document.documentElement.innerHTML.match(/G-[A-Z0-9]{6,12}/g) ?? [])],
  gtmIds:  [...(document.documentElement.innerHTML.match(/GTM-[A-Z0-9]{5,8}/g) ?? [])],
  hasGtag: typeof window.gtag === 'function',
}
```

**Badge assignment:**
- **Pass:** One GA4 ID (`G-XXXXXXXXXX`) or GTM container found, loaded once
- **High Value:** Analytics present but GA4 not confirmed (Universal Analytics only, or GTM with unknown config)
- **Critical:** No analytics whatsoever — owner is flying blind

**Record:** GA4 / GTM IDs found, badge

---

### Check 19 — Duplicate Pixel Firing
**JSON key:** `auditChecks.C05_2`

Use the IDs found in Check 18. Count occurrences:
```js
// playwright_evaluate — replace G-XXXXXXXXXX with actual ID:
(document.documentElement.innerHTML.match(/G-XXXXXXXXXX/g) ?? []).length
```

Also check platform-specific sources:
- **Squarespace:** GA4 ID in Settings → Analytics AND again in Code Injection = duplicate
- **WordPress:** Multiple analytics plugins active simultaneously

**Badge assignment:**
- **Pass:** Each tag fires exactly once
- **Critical:** Same tag loads twice — double-counts all traffic data

**Record:** occurrence count per ID, likely cause, badge

---

### Check 20 — Third-Party Script Inventory
**JSON key:** `auditChecks.C05_3`

```js
// playwright_evaluate:
[...new Set([...document.querySelectorAll('script[src]')].map(s => {
  try { return new URL(s.src).hostname; } catch { return null; }
}).filter(Boolean))]
```

**Badge assignment:**
- Always **Pass** (informational) — this is a baseline inventory, not a pass/fail check

**Record:** list of all third-party domains found, badge = Pass

---

## Category 06 — Security & Crawlability

### Check 21 — Robots.txt
**JSON key:** `auditChecks.C06_1`

Navigate to `[CLIENT_URL]/robots.txt` and take a snapshot.

**Badge assignment:**
- **Pass:** File exists, `User-agent: *` with no problematic Disallow rules, sitemap URL referenced
- **High Value:** File exists but missing sitemap reference, or has overly restrictive rules
- **Critical:** Returns 404 (missing), or `Disallow: /` blocks everything

**Record:** full robots.txt content (or "404 not found"), badge

---

### Check 22 — HTTPS / SSL
**JSON key:** `auditChecks.C06_2`

```js
// playwright_evaluate:
({
  protocol:    window.location.protocol,
  mixedContent: [...document.querySelectorAll('[src]')].filter(el => el.src?.startsWith('http://')).length,
})
```

Also check: does `http://[CLIENT_URL]` redirect to `https://`?
```
playwright_navigate: http://[CLIENT_DOMAIN_NO_HTTPS]
```

**Badge assignment:**
- **Pass:** `https://` everywhere, http redirects to https, no mixed content
- **High Value:** https present but http doesn't redirect, or mixed content warnings
- **Critical:** No SSL at all (rare in 2026, but flag immediately if found)

**Record:** protocol, mixed content count, redirect behavior, badge

---

### Check 23 — External Link Security
**JSON key:** `auditChecks.C06_3`

```js
// playwright_evaluate:
[...document.querySelectorAll('a[target="_blank"]')].map(a => ({
  text: a.textContent.trim().substring(0, 40),
  href: a.href.substring(0, 60),
  rel:  a.getAttribute('rel'),
})).filter(a => !a.rel?.includes('noopener'))
```

**Badge assignment:**
- **Pass:** All `target="_blank"` links include `rel="noopener noreferrer"`
- **Nice to Have:** One or two links missing `rel` (low risk in modern browsers, but best practice)
- **High Value:** Many external links missing `rel` — notable pattern

**Record:** count of offending links, examples, badge

---

### Check 24 — llms.txt
**JSON key:** `auditChecks.C06_4`

Navigate to `[CLIENT_URL]/llms.txt` and check if it loads.

**Badge assignment:**
- **Pass:** File exists with descriptive content
- **Nice to Have:** 404 (most sites don't have this yet — flag as a Sequel Web Studio upsell opportunity)

**Record:** exists or "404 not found", badge

---

## Category 07 — Accessibility

### Check 25 — Image Alt Text
**JSON key:** `auditChecks.C07_1`

```js
// playwright_evaluate:
{
  total:   document.querySelectorAll('img').length,
  missing: [...document.querySelectorAll('img')].filter(img => img.getAttribute('alt') === null).length,
  empty:   [...document.querySelectorAll('img')].filter(img => img.getAttribute('alt') === '' && !img.getAttribute('role')).length,
  samples: [...document.querySelectorAll('img')].slice(0, 6).map(img => ({
    src: img.currentSrc?.split('/').pop()?.substring(0, 40),
    alt: img.getAttribute('alt'),
  })),
}
```

**Badge assignment:**
- **Pass:** All images have alt attributes (decorative images may use `alt=""`)
- **High Value:** Under 25% of images missing alt text
- **Critical:** Over 25% of images missing alt text, or hero/product images missing alt

**Record:** total images, missing count, sample findings, badge

---

### Check 26 — HTML Lang Attribute
**JSON key:** `auditChecks.C07_2`

```js
// playwright_evaluate:
document.documentElement.getAttribute('lang')
```

**Badge assignment:**
- **Pass:** `lang="en"` (or appropriate language code)
- **High Value:** Missing `lang` attribute entirely

**Record:** value found or "missing", badge

---

## Category 08 — Platform & AI Discoverability

### Check 27 — Platform (already done)
**JSON key:** `auditChecks.C08_1`

Already recorded in Phase 1. No additional work.

---

### Check 28 — AI-Powered Search Readiness
**JSON key:** `auditChecks.C08_2`

Holistic judgment based on prior findings. Evaluate:

```js
// playwright_evaluate — check NAP consistency:
({
  hasAddress: /\d+\s+\w+\s+(st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|way|ct|court)/i.test(document.body.innerText),
  hasPhone:   /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/.test(document.body.innerText),
  hasHours:   /(monday|tuesday|wednesday|open|hours)/i.test(document.body.innerText),
})
```

Also consider (from earlier findings):
- Does LocalBusiness schema exist? (Check 15)
- Does llms.txt exist? (Check 24)
- Is homepage content structured clearly enough for an AI to describe the business?

**Badge assignment:**
- **Pass:** Schema present, clear NAP, structured content, llms.txt ideally present
- **High Value:** Missing LocalBusiness schema or no NAP data — AI can't accurately describe the business
- **Critical:** Homepage is image-heavy with minimal text — AI crawlers get nothing useful

**Record:** NAP presence, schema status, content structure assessment, badge

---

## B-Checks — Additional Diagnostics

Run these after the 28 standard checks. Not all apply to every site. Only run the ones that are relevant given what you've already found.

| B# | Check | Playwright action |
|----|-------|-------------------|
| **B01** | Mobile viewport meta | `document.querySelector('meta[name="viewport"]')?.getAttribute('content')` |
| **B02** | Mobile layout issues | `playwright_screenshot` at 375px viewport width; assess visually |
| **B03** | HTTP→HTTPS redirect | Navigate to `http://[domain]` (no www) — does it redirect to https? |
| **B04** | Non-www→www redirect | Navigate to `http://[domain]` without www — does it resolve correctly? |
| **B05** | 404 page quality | Navigate to `[url]/this-page-does-not-exist-404` — snapshot the result |
| **B06** | Sitemap accuracy | Navigate to `[url]/sitemap.xml` — does homepage URL match canonical? |
| **B07** | Draft pages in sitemap | Scan sitemap for `/draft/`, `/test/`, `/staging/` |
| **B08** | Cookie consent | Navigate in a fresh context — does a cookie banner appear? |
| **B09** | Privacy policy linked | `document.querySelector('a[href*="privacy"]')?.href` |
| **B10** | Physical address on homepage | Already checked in C08_2 NAP evaluation |
| **B11** | Phone number format | `[...document.querySelectorAll('a[href^="tel:"]')].map(a => a.href)` |
| **B12** | Social media links | `[...document.querySelectorAll('a[href*="facebook"],a[href*="instagram"],a[href*="linkedin"],a[href*="twitter"],a[href*="x.com"]')].map(a => a.href)` |
| **B13** | Embedded map on Contact | Navigate to Contact page — `document.querySelector('iframe[src*="google.com/maps"]')` |
| **B14** | Web form on Contact | Navigate to Contact page — `document.querySelector('form')` |
| **B15** | Inner page title quality | Navigate to 3 inner pages, run Check 1 on each |
| **B16** | Missing page-specific schema | FAQ page without FAQPage schema, Services page without Service schema |
| **B18** | Developer artifacts | `document.documentElement.innerHTML.match(/TODO|console\.log|staging\.|\.local/gi)` |
| **B19** | Favicon formats | `[...document.querySelectorAll('link[rel*="icon"]')].map(l => ({rel: l.rel, href: l.href}))` |
| **B20** | Copyright year in footer | `document.querySelector('footer')?.innerText?.match(/©\s*(\d{4})/)` |

---

## Platform-Specific Remedy Notes

Use these when writing remedy steps. Platform-specific paths matter — a vague "update your SEO settings" is not useful.

### Squarespace
- **SEO fields:** Pages panel → click page → gear icon → SEO tab
- **Analytics/GA4:** Settings → Analytics OR Settings → Advanced → External Services
- **Code Injection:** Settings → Advanced → Code Injection (header/footer) — check for duplicate GA4 here
- **Duplicate GA4 pattern:** GA4 set in Settings → Analytics AND copied again in Code Injection = Critical duplicate
- **Draft pages in sitemap:** Squarespace publishes test pages to /sitemap.xml — flag as High Value
- **OG images:** Set per page via gear → Social Image tab; site-wide default if not set

### WordPress
- **With Yoast SEO:** SEO menu in left sidebar → most fields there
- **With RankMath:** RankMath menu in left sidebar
- **Without either:** Settings → Reading for indexing; theme header for meta tags (inconsistent)
- **Multiple SEO plugins = duplicate meta tags:** Check if both Yoast and RankMath are active — very common after plugin switches
- **"Discourage search engines" checkbox:** Settings → Reading — sometimes left checked accidentally (Critical if found)
- **OG tags require a plugin:** Core WP doesn't add them — needs Yoast, RankMath, or a dedicated OG plugin

### Wix
- **SEO:** Site & App → SEO Tools, or individual page Settings → SEO Basics
- **Analytics:** Site & App → Marketing Integrations
- **JS-heavy = slow TTFB:** Wix pages are largely JS-rendered; TTFB over 2s is typical — flag but note it's platform-limited
- **Schema:** Wix adds some automatically; custom JSON-LD requires Wix Velo (developer mode) — flag as High Value
- **URL structure:** Wix URLs are sometimes not editable — note any `/page/` oddities

### Webflow
- **SEO settings:** Pages panel in Designer → page settings per page
- **Usually better HTML:** Webflow tends to produce cleaner semantic markup than Wix/Squarespace
- **Schema:** Webflow doesn't add structured data automatically — almost always missing — flag as Critical
- **Performance:** Large exported JS bundles can hurt LCP; check PageSpeed

---

## Wrapping Up

After all checks are complete:

1. **Review B-check findings** — assign B-numbers to any additional issues found
2. **Score tally** — count by badge type: Critical / High Value / Pass / Nice to Have
3. **Priority selection** — from all Critical and High Value items, select the 10 that most directly impact ranking, trust, or conversion for this specific client. All Criticals go first.
4. **Write executive summary** — 2–3 sentences covering the overall state and the most urgent theme
5. **List standalone deliverables** — any code blocks (JSON-LD, robots.txt content, meta tag snippets) that will be included in the Remedy Package

Then generate the JSON data file per `templates/audit-data-schema.json` and run the pipeline.

---

## Quick Reference — Pipeline After Audit

```
Playwright audit → findings recorded
        ↓
Generate: [client-slug]-audit-data-[month]-[year].json
        ↓  node scripts/fill-template.mjs [data-file]
Generate: [client-slug]-pro-diagnosis-[month]-[year].html
        ↓  node scripts/generate-audit-pdf.mjs [html-file]
Generate: [Client-Slug]-Remedy-Package-[Month]-[Year].pdf
        ↓  present to Joe for review
        ↓  on approval: node --env-file=.env scripts/send-delivery.mjs --to [email] --name "[name]" --pdf "[pdf-file]"
Delivered to client
```

---

*Sequel Web Studio · sequelwebstudio.com*
