# Live Audit Session Guide
## Pro Diagnosis + Remedy Package — Sequel Web Studio

> **How to use this:** Claude reads this file at the start of every autonomous audit session. Each check specifies the exact Playwright MCP action to run, the pass/fail criteria, the badge to assign, and the JSON key path for recording the finding. Execute checks in order. Record every finding immediately — do not batch. The session is not only the fixed checklist: after the 28 standard checks comes a **mandatory Exploration Pass** (browse the site like a customer and record everything noteworthy), then the B-check sweep. Insight quality is the product — it is never traded away for speed.

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

**Create the intake progress file now — before any checks:**

```
Write: audit-tool/[client-slug]-intake-progress.md
```

Start it with the client header (name, URL, platform, date). After each category of checks, append that category's findings in compact format — one line per check:

```
[CheckID] | [Badge] | [Key fact] | [Specific values/IDs found]
```

Example: `C01_1 | Pass | Title "Acme Plumbing | Fort Worth TX" (43 chars) |`

This externalizes findings from context to disk. Playwright snapshot payloads are large — on a complex platform like Wix or WordPress, a full session can exhaust the context window before the JSON is written. The progress file is the recovery point if that happens. Write to it after every category without exception.

**Use targeted evaluations over full snapshots whenever possible.**

`playwright_evaluate` with a specific query returns only the data needed — a few tokens. `playwright_snapshot` returns the full DOM accessibility tree — thousands of tokens. Reserve full snapshots for checks that genuinely require reading page structure (heading hierarchy, visual layout, navigation). Use targeted `evaluate` calls for everything extractable by a specific query (title, canonical, meta tags, schema blocks, script src attributes, etc.).

> **Borderline badge calls.** When a metric sits between two badge thresholds or the evidence is ambiguous, decide by current business impact for THIS client:
> - If the issue is costing leads, visibility, or trust **today** → take the higher-severity badge.
> - If the impact is hypothetical or future-only → take the lower-severity badge and say so honestly in the impact copy.
>
> Never inflate a badge to pad the Critical/High Value counts, and never round down to make the report look cleaner. State the borderline reasoning in the `found` text (e.g., "162 chars — just past Google's ~155-char truncation point") so Joe can see the call that was made.

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

> **Checkpoint — write Platform ID to intake progress file before continuing:**
> `C08_1 | Pass | [Platform name] | [Identifying URL fragment or generator tag]`

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

> **Checkpoint — write Category 01 findings to intake progress file before continuing:**
> One line per check: `[CheckID] | [Badge] | [Key fact] | [Specific values found]`
> Example: `C01_1 | Pass | Title "Acme Plumbing | Fort Worth TX" (43 chars) |`

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

> **Checkpoint — write Category 02 findings to intake progress file before continuing.**

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

> **Checkpoint — write Category 03 findings to intake progress file before continuing.**
> Include PageSpeed scores and any specific numbers (LCP ms, TTFB ms, savings KiB) — these are easy to lose from context.
>
> **While PageSpeed Insights is still open:** Also read and record CLS (Cumulative Layout Shift) and INP (Interaction to Next Paint) from the Core Web Vitals section. You will record these as B_CWV1 and B_CWV2 in the B-check section — but capture them now while the page is visible, not later from memory.

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

**Standalone deliverable — always write when schema is Critical or High Value:**

Write a complete three-block entity graph as the standalone code deliverable. This goes far beyond a single LocalBusiness block — it creates an interconnected knowledge graph that AI systems can traverse. All three blocks must be in a single `<script type="application/ld+json">` tag as a JSON array.

Field sourcing instructions:
- `@id` URLs: always `https://[client-domain]/#website`, `#organization`, `#owner`
- Business name, phone, address, hours: read from homepage footer, Contact page, or schema already on site
- `geo` coordinates: get from their Google Maps listing (right-click the pin → copy coordinates)
- `hasMap`: full Google Maps URL from their listing
- `sameAs`: collect every directory URL you can confirm (Google Maps, Facebook, Yelp, LinkedIn, BBB) — verify each one loads the correct business before including it
- `knowsAbout`: list the client's 3–5 primary services as plain strings
- `openingHoursSpecification`: use `dayOfWeek` array with schema.org day names (Monday, Tuesday, etc.), `opens`/`closes` in 24h format
- Owner name: from About page, homepage bio, or footer signature
- `potentialAction` target: use `https://[domain]/?s={search_term_string}` (works even if the site doesn't have search — it's a schema hint to search engines, not a functional URL requirement)

```json
[
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://[DOMAIN]/#website",
    "url": "https://[DOMAIN]",
    "name": "[BUSINESS NAME]",
    "publisher": { "@id": "https://[DOMAIN]/#organization" },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://[DOMAIN]/?s={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://[DOMAIN]/#organization",
    "name": "[BUSINESS NAME]",
    "url": "https://[DOMAIN]",
    "telephone": "[PHONE]",
    "email": "[EMAIL if public]",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "[STREET]",
      "addressLocality": "[CITY]",
      "addressRegion": "[STATE]",
      "postalCode": "[ZIP]",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "[LAT]",
      "longitude": "[LNG]"
    },
    "hasMap": "[GOOGLE MAPS URL]",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "$",
    "knowsAbout": ["[SERVICE 1]", "[SERVICE 2]", "[SERVICE 3]"],
    "sameAs": [
      "[GOOGLE MAPS URL]",
      "[FACEBOOK PAGE URL]",
      "[YELP LISTING URL]",
      "[LINKEDIN PAGE URL]",
      "[BBB PROFILE URL]"
    ],
    "image": "[OG IMAGE URL or logo URL]"
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://[DOMAIN]/#owner",
    "name": "[OWNER NAME]",
    "worksFor": { "@id": "https://[DOMAIN]/#organization" }
  }
]
```

Remove any fields you cannot source accurately — a complete block with real data is better than a full block with placeholder guesses. After writing the block, note in the `technical` field of C04_1 which fields you populated and which were omitted.

---

### Check 16 — Schema Connectivity
**JSON key:** `auditChecks.C04_2`

Inspect the JSON-LD blocks from Check 15 for `@id` properties and `sameAs` arrays.

```js
// playwright_evaluate — extract @id and sameAs from all LD+JSON blocks:
[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => {
  try {
    const d = JSON.parse(s.textContent);
    const blocks = Array.isArray(d) ? d : [d];
    return blocks.map(b => ({ type: b['@type'], id: b['@id'], sameAs: b['sameAs'] }));
  } catch { return []; }
})
```

**Badge assignment:**
- **Pass:** Schema blocks are linked via `@id` cross-references AND `sameAs` includes Google Maps + at least one other authoritative directory (Facebook, Yelp, BBB, LinkedIn)
- **High Value:** Schema present but `sameAs` is missing entirely, has fewer than 2 verifiable URLs, or blocks have no `@id` linking
- **Nice to Have:** `sameAs` present but incomplete (has 1 directory URL, missing Google Maps specifically)

**Why sameAs matters for AI search:** `sameAs` is how ChatGPT, Perplexity, and Google AI Overviews verify a business's identity before recommending it. An AI system cross-checks schema entities against directories it's already indexed. Without `sameAs` links, the AI cannot confirm the business is real — and the default behavior is not to recommend an unverifiable entity.

**Record:** all `@id` values found, all `sameAs` URLs found (verify each one resolves to the correct business listing), badge

> **Note:** If sameAs is High Value or the entity graph is incomplete, this finding is addressed by the same remedy item as C04_1 — the full entity graph standalone deliverable includes a complete sameAs array. Set `remedyItem` for C04_2 to the same number as C04_1.

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

> **Checkpoint — write Category 04 findings to intake progress file before continuing.**
> Include all `@type` values found, all `@id` and `sameAs` values, and the standalone deliverable trigger (yes/no).

---

## Category 05 — Analytics & Tracking Integrity

> **Read this first — the analytics blind-spot rule.** These checks are **vendor-agnostic**. Google is one option among many, not the definition of "analytics." A site with no Google tag may still be fully instrumented with Meta, Amazon, a privacy-friendly tool, a first-party script, or a platform-native dashboard. A live browser scan only sees **client-side tracking on the pages you load**. It is blind to server-side tracking (Meta Conversions API, server-side GTM, Amazon Attribution server events), off-site dashboards (Amazon KDP/Ads, a platform's proprietary back-end like ModFarm/Squarespace/Shopify), and other properties/subdomains (e.g. a separate `shop.` store). **Never conclude "no analytics" or write "flying blind" / "measures nothing" from a client-side scan.** State what you checked and name what you cannot see. (This category was rewritten July 2026 after a Google-only check produced a false "no analytics" finding on a book publisher's site that was, in fact, running first-party and platform-native tracking.)

### Check 18 — Analytics & Measurement Coverage
**JSON key:** `auditChecks.C05_1`

Detect measurement in **three layers**, not just by looking for Google. Run all three before badging.

**Layer 1 (primary) — capture what the page actually sends.** Navigate, let the page settle, then scroll and (if present) click a nav item or CTA to trigger event beacons. Then capture the network log and match request URLs against the vendor list below:

```
playwright_navigate: [CLIENT_URL]
# scroll / interact to fire event beacons, then:
mcp__playwright__browser_network_requests
```

**Layer 2 (secondary) — global objects and tag IDs in the page.**
```js
// playwright_evaluate:
({
  google:   { gtag: typeof window.gtag === 'function', dataLayer: Array.isArray(window.dataLayer),
              gtagIds: [...new Set(document.documentElement.innerHTML.match(/G-[A-Z0-9]{6,12}/g) ?? [])],
              gtmIds:  [...new Set(document.documentElement.innerHTML.match(/GTM-[A-Z0-9]{5,8}/g) ?? [])] },
  meta:     typeof window.fbq === 'function',
  tiktok:   typeof window.ttq !== 'undefined',
  linkedin: typeof window._linkedin_partner_id !== 'undefined',
  plausible:typeof window.plausible === 'function',
  matomo:   typeof window.Matomo !== 'undefined' || typeof window._paq !== 'undefined',
})
```

**Layer 3 — host inventory + first-party analytics scripts.** Classify every script/img/iframe host by vendor, AND flag first-party analytics scripts by filename (this is what catches a self-hosted tracker like `analytics-book-cards.js`):
```js
// playwright_evaluate:
({
  hosts: [...new Set([...document.querySelectorAll('script[src],img[src],iframe[src]')].map(e => {
    try { return new URL(e.src).hostname; } catch { return null; }
  }).filter(Boolean))],
  firstPartyAnalytics: [...document.querySelectorAll('script[src]')]
    .map(s => s.src).filter(src => /analytics|tracking|telemetry|beacon|collect|metrics|\bstats\b/i.test(src)),
})
```

**Vendor signature list** (match against network-request URLs and hosts):

| Vendor / category | Signatures |
|---|---|
| Google | `google-analytics.com`, `googletagmanager.com`, `/g/collect`, `region*.google-analytics.com` |
| Meta | `connect.facebook.net`, `facebook.com/tr` |
| Amazon | `amazon-adsystem.com`, `fls-na.amazon.com` (Attribution), `assoc-amazon` |
| TikTok / Pinterest / LinkedIn | `analytics.tiktok.com`, `ct.pinterest.com`, `px.ads.linkedin.com` |
| Segment | `cdn.segment.com`, `api.segment.io` |
| Privacy-friendly | `plausible.io`, `usefathom.com`, Matomo/Piwik (`*.matomo.cloud`, `/matomo.php`, `/piwik.php`), Cloudflare Web Analytics (`cloudflareinsights.com`) |
| Product / behavior | `hotjar`, `clarity.ms`, `mixpanel`, `heap`, `fullstory`, `mouseflow` |

**Platform-native awareness.** Squarespace Analytics, Shopify Analytics, Wix Analytics, WordPress Jetpack Stats, and proprietary platforms (ModFarm, etc.) collect data server-side and **do not appear as a third-party tag**. If the platform (from Check 27) has native analytics, absence of a third-party tag is not a measurement gap — note it as covered by the platform dashboard.

**Badge assignment (conservative — the whole point of this rewrite):**
- **Pass:** Any credible measurement detected — a third-party analytics tag, a first-party analytics script, OR a platform with native analytics. Informational.
- **Nice to Have:** Measurement is present but looks thin or single-source, OR you cannot confirm it captures traffic **source** and **conversions**. Phrase as "confirm your setup captures traffic sources and conversions," never "you have nothing."
- **High Value:** A genuine likely gap on a site whose leads depend on the website (e.g. a small-business lead-gen site with no client-side tags, no native platform analytics, and no first-party script). Present **two paths side by side and let the client choose**: GA4 (free, powerful, widely supported) and a privacy-respecting alternative (Plausible, Fathom, or Matomo). Keep GA4 a first-class recommendation; do not lean on it as the only option.
- **Critical:** Effectively unreachable from a browser scan alone — do **not** assign Critical for analytics on client-side evidence only. If instrumentation genuinely appears absent, use **High Value** and word the finding as "we could not detect any measurement on the pages we scanned; please confirm what you use," inviting correction.

**Record:** every vendor/tag detected (network beacons + globals), any first-party analytics scripts, whether the platform has native analytics, the scope caveat, and badge. When in doubt between two badges, take the lower severity and say why.

---

### Check 19 — Duplicate / Over-Firing Tags
**JSON key:** `auditChecks.C05_2`

Using the network log from Check 18 (Layer 1), count how many times each analytics collector endpoint is hit per page load. This is more reliable than counting IDs in `innerHTML`. A single GA4 or pixel ID that fires twice on one load = double-counting.

Also check platform-specific duplicate sources:
- **Squarespace:** same GA4 ID in Settings → Analytics AND again in Code Injection
- **WordPress:** two analytics plugins active at once (e.g. Site Kit + a manual gtag snippet)

**Badge assignment:**
- **Pass:** Each tag fires exactly once (or no tags to duplicate)
- **Critical:** The same tag fires twice on a single load — double-counts all traffic data

**Record:** occurrence count per tag from the network log, likely cause, badge

---

### Check 20 — Tracking Inventory (Third-Party + First-Party)
**JSON key:** `auditChecks.C05_3`

This is the informational roll-up of Check 18's Layer 3: the full list of third-party hosts plus any first-party analytics scripts found.

**Badge assignment:**
- Always **Pass** (informational) — a baseline inventory, not a pass/fail check

**Record:** list of all third-party domains + first-party analytics scripts found, badge = Pass

---

> **Checkpoint — write Category 05 findings to intake progress file before continuing.**
> Record every vendor/tag detected (from network beacons and globals), any first-party analytics scripts (e.g. a self-hosted tracker), whether the platform has native analytics, and the explicit scope caveat (client-side only; server-side, off-site, and other subdomains not visible). Do not reduce this to "GA4/GTM IDs."

---

## Category 06 — Security & Crawlability

### Check 21 — Robots.txt
**JSON key:** `auditChecks.C06_1`

Navigate to `[CLIENT_URL]/robots.txt` and take a snapshot.

**Badge assignment:**
- **Pass:** File exists, `User-agent: *` with no problematic Disallow rules, sitemap URL referenced
- **High Value:** File exists but missing sitemap reference, or has overly restrictive rules
- **Critical:** Returns 404 (missing), or `Disallow: /` blocks everything

**Record:** full robots.txt content (or "404 not found"), badge — paste key lines into the progress file now, not later.

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
- **Pass:** File exists with substantive descriptive content (not just a placeholder)
- **High Value:** File exists but is empty or has only a one-liner
- **Critical:** 404 — file is missing entirely

**Record:** exists or "404 not found", badge

**Standalone deliverable — write the complete file when Critical or High Value:**

Do not just tell the client to add an llms.txt. Write the complete file content for them during the audit session. Source each section from the live site — About page, Services page, homepage content, and Contact page.

Structure the file as follows (use actual client data, not these placeholder labels):

```
# [Business Name]
> [One sentence: who they are, what they do, where they're located]

[Business Name] is a [business type] serving [city/region]. [One sentence on what makes them different or their key approach — from homepage hero or About page.]

## Services
- [Service 1 name]: [One sentence description]. [Price if publicly listed.]
- [Service 2 name]: [One sentence description]. [Price if publicly listed.]
- [Continue for all primary services]

## Contact
- Phone: [number]
- Email: [email address if public]
- Address: [full street address]
- Hours: [e.g., Monday–Friday 8am–5pm]

## Frequently Asked Questions
Q: [Question sourced from site FAQ, or a common question implied by their services]
A: [Answer from site, written in plain English]

Q: [Second question]
A: [Answer]

Q: [Third question if applicable]
A: [Answer]

## About
[2–3 sentences about the business or owner, sourced from the About page. Who they are, how long they've been in business, what they stand for.]

## Key Pages
- Homepage: https://[DOMAIN]/
- Services: https://[DOMAIN]/services (or wherever services live)
- About: https://[DOMAIN]/about
- Contact: https://[DOMAIN]/contact
```

Sourcing notes:
- Services: pull names and descriptions from the Services page or homepage service cards
- FAQ: look for accordion sections, "Frequently Asked Questions" headings, or Q&A-style content anywhere on the site. If no FAQ exists, write 2–3 questions implied by the business type (e.g., for a plumber: "Do you offer emergency service?", "What areas do you serve?")
- About: pull from the About page bio or founder statement
- Hours: check homepage footer, Contact page, or LocalBusiness schema already present
- Omit any section you cannot populate with real data — a shorter accurate file is better than a longer one with guesses

After writing, include the complete file text as the `code` field in the standalone deliverable object in the JSON data file.

---

> **Checkpoint — write Category 06 findings to intake progress file before continuing.**
> If llms.txt content was found, paste a brief summary of what it contains (e.g., "Wix auto-generated API docs" or "present, substantive business description").

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

> **Checkpoint — write Category 07 findings to intake progress file before continuing.**

---

## Category 08 — Platform & AI Discoverability

### Check 27 — Platform (already done)
**JSON key:** `auditChecks.C08_1`

Already recorded in Phase 1. No additional work.

---

### Check 28 — AI Citation Readiness (5-Signal Score)
**JSON key:** `auditChecks.C08_2`

Score this check using five concrete signals drawn from earlier findings in the session. Do not assign a holistic impression — count the signals.

**The 5 signals:**

| # | Signal | Pass condition |
|---|--------|---------------|
| 1 | LocalBusiness schema with complete data | `@type: LocalBusiness` present with name, address, phone, and hours all populated |
| 2 | sameAs links to 2+ authoritative directories | `sameAs` array includes Google Maps + at least one other (Facebook, Yelp, BBB, LinkedIn) |
| 3 | llms.txt present with substantive content | `/llms.txt` returns a file with more than a one-liner |
| 4 | FAQPage schema present | At least one `@type: FAQPage` block with populated `mainEntity` Q&A pairs |
| 5 | Static text content describing the business | Homepage has readable, indexable text (not all content in image sliders, JS-rendered carousels, or video-only sections) |

**Evaluate signal 5 with:**
```js
// playwright_evaluate — check for readable body text:
({
  bodyTextLength: document.body.innerText.replace(/\s+/g, ' ').trim().length,
  hasAddress: /\d+\s+\w+\s+(st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|way|ct|court)/i.test(document.body.innerText),
  hasPhone:   /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/.test(document.body.innerText),
  hasHours:   /(monday|tuesday|wednesday|open|hours)/i.test(document.body.innerText),
})
```

Signal 5 passes if bodyTextLength > 400 AND at least one of hasAddress / hasPhone / hasHours is true.

**Badge assignment:**
- **Pass:** 5/5 or 4/5 signals present
- **High Value:** 3/5 or 2/5 signals present
- **Critical:** 1/5 or 0/5 signals present

**Record:** list all 5 signals and mark each ✓ or ✗, state the score (e.g., "3/5"), badge

The `found` field in the JSON should name which signals passed and which failed — e.g.: "Score: 2/5. LocalBusiness schema: ✓. sameAs links: ✗ (none present). llms.txt: ✗ (404). FAQPage schema: ✗ (no FAQ content). Static text content: ✓."

This check is informational — it is a summary of findings from C04_1, C04_2, C06_4, and B_AI2. It does not need its own remedy item if those other checks already have remedy items. Set `remedyItem: null` for this check and note in the `impact` field which remedy items address the gaps.

---

> **Checkpoint — write Category 08 findings to intake progress file before continuing.**
> Record the 5-signal score (e.g., "1/5 — signals 2, 3, 4 failing") and confirm which gaps are already covered by earlier remedy items.
>
> At this point all 28 standard checks are done. Review the progress file briefly — confirm no badge is missing. If the JSON synthesis step runs out of context from here, the progress file is the complete recovery point.

---

## Exploration Pass — Browse Like a Customer (MANDATORY)

This phase is required on every audit, even when all 28 standard checks pass. The fixed checklist finds technical defects; this pass finds everything else. It is where the audit earns its price.

**What to do:**

1. Browse the site the way a prospective customer would: homepage, every top-nav page, the contact page, and at least 1–2 service/product inner pages — minimum 4–5 pages total.
2. Do the pass twice: once at desktop width, once at mobile width (`browser_resize` to 375×812). Take a homepage screenshot at both widths.
3. **Be curious about EVERYTHING. You are not limited to any list.** Note anything a paying customer — or a competitor's marketer — would notice. Examples (not limits):
   - **Copy:** typos, dated content ("Christmas specials" in June), stale blog/news, placeholder text, weak or generic headlines
   - **CTAs:** missing, vague ("Submit"), buried below the fold, or competing calls to action
   - **Trust signals:** reviews, licenses, certifications, team photos, guarantees, years in business — present, absent, or stale
   - **Broken things:** dead links, missing images, layout overlap or horizontal scroll at 375px, console errors
   - **Images:** low resolution, stretched, obviously stock, slow-loading hero media
   - **UX:** confusing navigation, form friction (too many required fields), hard-to-find phone number or hours
4. Record EVERY noteworthy observation as a new B-check: take the next free number (B23, B24, …), give it a short name, a badge, and found/impact copy — the same JSON shape as any other B-check. A genuine strength worth telling the client about may be recorded as a Pass entry.

**Recording rule: there is no "too small."** If you noticed it, the client's customers notice it. The cost of recording one more B-check is one JSON entry. The cost of missing it is that the client paid for a professional diagnosis and a competitor's free tool catches what we didn't.

---

> **Checkpoint — write Exploration Pass findings to intake progress file before continuing to B-Checks.**
> One line per new B-number (B23+), same compact format as every other check. If the pass genuinely produced nothing noteworthy, write `Exploration Pass | complete | no additional findings` — an explicit empty result, never a silent skip.

---

## B-Checks — Additional Diagnostics

Run these after the 28 standard checks and the Exploration Pass. **This table is a floor, not a ceiling.** Run every B-check below unless it is structurally inapplicable to the site (e.g., B22 hreflang on a single-language local business) — and when you skip one, write a one-line note in the progress file saying why. Most B-checks are a single `playwright_evaluate` call; the cost of running one is trivial, the cost of a missed finding is not. Anything observed during the Exploration Pass that isn't covered below gets a new B-number (B23+). Never suppress a finding because it doesn't fit an existing label.

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
| **B14** | Contact form — existence and live submission | Navigate to Contact page — `document.querySelector('form')`; then fill and submit a test message; verify a success response appears — see detailed section below |
| **B15** | Inner page title quality | Navigate to 3 inner pages, run Check 1 on each |
| **B16** | Missing page-specific schema | FAQ page without FAQPage schema, Services page without Service schema |
| **B17** | Mixed content (HTTP on HTTPS page) | `[...document.querySelectorAll('img[src^="http://"],script[src^="http://"],link[href^="http://"],iframe[src^="http://"]')].map(e => e.src \|\| e.href)` |
| **B18** | Developer artifacts | `document.documentElement.innerHTML.match(/TODO|console\.log|staging\.|\.local/gi)` |
| **B19** | Favicon formats | `[...document.querySelectorAll('link[rel*="icon"]')].map(l => ({rel: l.rel, href: l.href}))` |
| **B20** | Copyright year in footer | `document.querySelector('footer')?.innerText?.match(/©\s*(\d{4})/)` |
| **B21** | Video content presence | `({ videos: document.querySelectorAll('video').length, embeds: [...document.querySelectorAll('iframe')].filter(f => /youtube\|vimeo\|wistia/i.test(f.src)).length })` |
| **B22** | hreflang tags (international/multilingual) | `[...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(l => ({lang: l.hreflang, href: l.href}))` |
| **B_AI1** | sameAs authority links | Extract `sameAs` from all LD+JSON blocks (see Check 16 script); verify each URL loads the correct business listing |
| **B_AI2** | FAQPage schema from site FAQ content | Scan for FAQ-like content (`document.querySelectorAll('[class*="faq"],[id*="faq"],details,summary')`); check whether FAQPage schema exists |
| **B_CWV1** | Cumulative Layout Shift (CLS) | Read CLS from PageSpeed Insights mobile results (already open from Category 03) — also collectable via `performance.getEntriesByType('layout-shift').reduce((s,e)=>s+e.value,0).toFixed(3)` |
| **B_CWV2** | Interaction to Next Paint (INP) | Read INP from PageSpeed Insights mobile results (already open from Category 03) — shown as "Interaction to Next Paint" in the Core Web Vitals section |
| **B_GBP1** | Google Business Profile quality | Open GBP listing from sameAs URL or Google search; manually score 5 signals — see detailed section below |
| **B_GBP2** | NAP consistency across citations | Visit each sameAs URL + Yelp + Bing Places; record exact business Name, Address, Phone and compare — see detailed section below |
| **B_A11Y1** | Form input labels | See detailed section below — run on the contact page |
| **B_A11Y2** | Keyboard focus visibility | See detailed section below |
| **B_A11Y3** | Color contrast spot-check | See detailed section below |
| **B_A11Y4** | Link text quality | See detailed section below |

---

### B_AI1 — sameAs Authority Links

Run only if C04_1 found LocalBusiness schema (otherwise sameAs is moot until schema is added — flag as part of that remedy instead).

```js
// playwright_evaluate — extract sameAs from all LD+JSON blocks:
[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => {
  try {
    const d = JSON.parse(s.textContent);
    const blocks = Array.isArray(d) ? d : [d];
    return blocks.flatMap(b => b.sameAs ? (Array.isArray(b.sameAs) ? b.sameAs : [b.sameAs]) : []);
  } catch { return []; }
})
```

For each URL returned: navigate to it briefly and confirm it loads the correct business listing (right name, right location). Flag any URL that resolves to the wrong business or a 404.

**Badge assignment:**
- **Pass:** `sameAs` contains a verified Google Maps listing URL + at least one other verified directory (Facebook business page, Yelp listing, BBB profile, or LinkedIn company page)
- **High Value:** `sameAs` is missing entirely OR has fewer than 2 verified directory URLs OR does not include Google Maps
- **Nice to Have:** `sameAs` present but missing Google Maps specifically (has Yelp/Facebook but not Maps)

**Impact copy for High Value:** "When ChatGPT or Perplexity encounters your business in schema markup, they cross-check it against directory listings they've already indexed. Without verified sameAs links, AI tools can't confirm your business identity — and the conservative default is not to recommend an entity they can't verify."

**Standalone deliverable — write when High Value:**
Write an updated LocalBusiness schema block (or the full entity graph if C04_1 was also a finding) with a corrected `sameAs` array. Include:
1. Google Maps listing URL (copy from their Google Business Profile — it looks like `https://maps.app.goo.gl/...` or `https://www.google.com/maps/place/...`)
2. Facebook business page URL (if they have one)
3. Yelp listing URL (if they have one)
4. BBB profile URL (if they have one)
5. LinkedIn company page URL (if they have one)

Note in the findings which of these directory profiles the client actually has. If they don't have a Google Business Profile claimed, flag that separately as a high-priority action — it's the single most impactful thing they can do for local AI search visibility.

---

### B_AI2 — FAQPage Schema from Site FAQ Content

```js
// playwright_evaluate — check for FAQ-like content and existing FAQPage schema:
({
  faqElements: document.querySelectorAll('[class*="faq" i],[id*="faq" i],details,summary,[class*="accordion" i],[class*="question" i]').length,
  faqHeadings: [...document.querySelectorAll('h2,h3,h4')].filter(h => /faq|frequently asked|questions/i.test(h.textContent)).map(h => h.textContent.trim()),
  hasFaqSchema: [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => {
    try { const d = JSON.parse(s.textContent); const b = Array.isArray(d) ? d : [d]; return b.some(x => x['@type'] === 'FAQPage'); } catch { return false; }
  }),
})
```

**Badge assignment:**
- **High Value:** `faqElements > 0` or `faqHeadings.length > 0`, AND `hasFaqSchema` is false (FAQ content exists but no FAQPage schema)
- **Nice to Have:** No FAQ content found anywhere on the site
- **Pass:** FAQPage schema present and populated

**Impact copy for High Value:** "FAQPage schema is the most directly quotable structured data type for AI assistants. When a user asks ChatGPT or Google AI Overview a question that your FAQ answers, those tools can surface your answer directly — but only if the question and answer are in FAQPage schema format, not just readable HTML."

**Standalone deliverable — write when High Value:**
Navigate to each FAQ section on the site and extract the actual questions and answers. Write a complete FAQPage JSON-LD block:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question text exactly as on the site]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer text, written in plain prose. Do not include HTML tags.]"
      }
    },
    {
      "@type": "Question",
      "name": "[Second question]",
      "acceptedAnswer": { "@type": "Answer", "text": "[Second answer]" }
    }
  ]
}
```

Include all FAQ questions found on the site (no minimum or maximum). Deliver as a standalone code block with instructions to add it to the same code injection location as the LocalBusiness schema.

---

### B_A11Y1 — Form Input Labels

Run on the contact page (or wherever the primary form lives — found during B14).

```js
// playwright_evaluate — check every visible form control for an accessible label:
[...document.querySelectorAll('input:not([type=hidden]),select,textarea')].map(el => ({
  type: el.type || el.tagName.toLowerCase(),
  name: el.name || el.id || '(unnamed)',
  labelled: !!(el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')),
  placeholderOnly: !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !!el.placeholder,
}))
```

**Badge assignment:**
- **Pass:** Every control has a real label (`<label>`, `aria-label`, or `aria-labelledby`)
- **Nice to Have:** Controls rely on placeholder text only (placeholder disappears once the visitor starts typing)
- **High Value:** One or more controls have no label of any kind

**Impact copy for High Value:** "Form fields without labels are invisible to screen readers, which means some visitors physically cannot fill out your contact form. They also make the form harder to use for everyone: autofill breaks, and on mobile a mislabeled field is a common reason people abandon a form instead of submitting it. Every abandoned form is a lead that never reaches you."

---

### B_A11Y2 — Keyboard Focus Visibility

```js
// playwright_evaluate — check whether the stylesheet suppresses focus outlines:
(() => {
  let kills = [], custom = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const r of sheet.cssRules) {
        if (!r.selectorText) continue;
        if (/:focus/.test(r.selectorText)) {
          if (/outline\s*:\s*(none|0)/.test(r.cssText) && !/box-shadow|border|background/.test(r.cssText)) kills.push(r.selectorText);
          else custom.push(r.selectorText);
        }
      }
    } catch { /* cross-origin sheet — skip */ }
  }
  return { focusKillRules: kills.slice(0, 5), customFocusRules: custom.slice(0, 5) };
})()
```

**Badge assignment:**
- **Pass:** No outline-killing rules, OR every kill rule is paired with a visible replacement (`box-shadow`, border, or background change on focus)
- **High Value:** `outline: none`/`outline: 0` on `:focus` with no visible replacement anywhere

**Impact copy for High Value:** "Visitors who navigate with a keyboard instead of a mouse (including many people with motor or vision impairments) rely on a visible outline to know where they are on the page. Your stylesheet removes that outline without replacing it, which makes the site unusable by keyboard. This is one of the most commonly cited issues in ADA website complaints against small businesses, and the fix is a few lines of CSS."

---

### B_A11Y3 — Color Contrast Spot-Check

This is a spot-check of the two highest-impact text elements, not a full WCAG audit. Frame it that way in the findings.

```js
// playwright_evaluate — contrast ratio for body text and the primary CTA:
(() => {
  const lum = (c) => {
    const m = c.match(/\d+(\.\d+)?/g)?.map(Number) ?? [0,0,0];
    const [r,g,b] = m.slice(0,3).map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055) ** 2.4; });
    return 0.2126*r + 0.7152*g + 0.0722*b;
  };
  const bgOf = (el) => { // walk up until a non-transparent background is found
    while (el) {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && !/rgba?\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
      el = el.parentElement;
    }
    return 'rgb(255, 255, 255)';
  };
  const ratio = (el) => {
    const s = getComputedStyle(el);
    const l1 = lum(s.color), l2 = lum(bgOf(el));
    return ((Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05)).toFixed(2);
  };
  const body = document.querySelector('main p, p');
  const cta = [...document.querySelectorAll('a,button')].find(e => /quote|contact|call|book|schedule|get started|buy|order/i.test(e.innerText));
  return {
    bodyText: body ? { sample: body.innerText.slice(0, 50), ratio: ratio(body) } : null,
    primaryCta: cta ? { text: cta.innerText.trim().slice(0, 40), ratio: ratio(cta) } : null,
  };
})()
```

**Badge assignment:**
- **Pass:** Body text ≥ 4.5:1 and CTA ≥ 3:1 (WCAG AA thresholds)
- **Nice to Have:** Marginal (body 4.0–4.5:1, or CTA 2.5–3:1)
- **High Value:** Body text below 4.0:1 or CTA below 2.5:1

**Impact copy for High Value:** "Low-contrast text is hard to read for anyone over 40, anyone on a phone in sunlight, and anyone with reduced vision. When your main text or your call-to-action button fails the standard contrast threshold, a portion of every visit ends with the visitor squinting at your page and leaving instead of reading why they should hire you."

---

### B_A11Y4 — Link Text Quality

```js
// playwright_evaluate — count generic link text:
(() => {
  const generic = ['click here','read more','learn more','here','more','this page','link'];
  const hits = [...document.querySelectorAll('a')]
    .map(a => a.innerText.trim().toLowerCase())
    .filter(t => generic.includes(t));
  return { count: hits.length, samples: [...new Set(hits)] };
})()
```

**Badge assignment:**
- **Pass:** 0 generic links
- **Nice to Have:** 1–2 generic links
- **High Value:** 3 or more generic links

**Impact copy for High Value:** "Links that just say 'click here' or 'learn more' waste two audiences at once. Screen reader users often jump through a page link by link, and a list of identical 'learn more' links tells them nothing. Google also uses link text to understand what the destination page is about, so descriptive links ('See our lawn care pricing') help the pages they point to rank for those words."

---

### B14 — Contact Form Live Submission Test

> This check replaces the previous existence-only check. Finding a `<form>` element confirms a form was added; submitting it confirms the form actually delivers messages. A broken form that accepts input but silently fails is the most damaging uncaught issue a lead-generation site can have.

Navigate to the Contact page (or wherever the primary form lives — found earlier in the session).

**Step 1 — Confirm the form and its controls exist:**
```js
// playwright_evaluate:
({
  hasForm:      !!document.querySelector('form'),
  inputCount:   document.querySelectorAll('input:not([type=hidden]),select,textarea').length,
  submitButton: document.querySelector('button[type=submit],input[type=submit]')?.innerText?.trim() ?? null,
  honeypot:     document.querySelectorAll('input[name*="honey" i],input[tabindex="-1"],input[aria-hidden="true"]').length > 0,
})
```

**Step 2 — Submit a test message:**

Fill the form with realistic test data using `browser_fill_form` and submit with `browser_click`. Use values that read as a plausible short inquiry:
- Name: `Website Audit Test`
- Email: `joe@sequelwebstudio.com` (or your test email — this is where any confirmation would land)
- Phone: `(555) 555-0100` if a phone field is present
- Message: `Test from website audit — please disregard this submission.`

Submitting via `browser_fill_form` also tests UX quality: if filling the form requires unusual steps or produces errors, note them as part of the finding.

**Step 3 — Observe and record the response:**

Take a snapshot immediately after submitting. Look for:
- A success message on-page ("Thanks! We'll be in touch.") → **Pass**
- A redirect to a thank-you page → **Pass**
- The page reloads with a cleared form and no visible feedback → likely silent failure → **Critical**
- A server error (500) or broken endpoint error → **Critical**
- No change after clicking Submit — button appears broken → **Critical**

> Do NOT wait to see if Joe receives the test email — that is outside audit scope. Record the on-page response only.

**Badge assignment:**
- **Pass:** Form exists AND submission produces a clear success message or redirect
- **High Value:** Form exists and submits, but success messaging is vague or absent; OR form has no honeypot/spam protection of any kind
- **Critical:** Form does not exist on Contact page; OR submission returns a server error or broken endpoint; OR submit button is present but non-functional

**Impact copy for Critical:** "Your contact form is where visitors become leads. A form that silently fails means every person who filled it out and waited for a reply heard nothing — and you had no way to know. That's lost revenue with no audit trail, and it continues until the form is fixed."

**Record:** form existence, submission result (describe what the page showed), spam protection detected (yes/no), success messaging quality, badge

---

### B_CWV1 — Cumulative Layout Shift (CLS)

Read from PageSpeed Insights mobile results captured during Category 03.

**What it measures:** CLS quantifies how much the visible page content unexpectedly shifts while loading — images popping in and pushing text down, banners appearing above nav, etc. A high CLS score makes the page feel broken and unreliable.

**Badge assignment:**
- **Pass:** CLS < 0.1
- **High Value:** CLS 0.1–0.25
- **Critical:** CLS > 0.25

**Common causes of high CLS:** Images without explicit width/height attributes; web fonts loading after text (FOUT); ads or banners injected without reserved space; late-loading embeds (YouTube, Google Maps) without a fixed container.

**Record:** CLS value from PageSpeed, badge

---

### B_CWV2 — Interaction to Next Paint (INP)

Read from PageSpeed Insights mobile results captured during Category 03. INP replaced First Input Delay (FID) as an official Core Web Vital in March 2024.

**What it measures:** INP measures the time from a user interaction (tap, click, key press) to the next visual response from the page. High INP means the page feels unresponsive — buttons take a visible pause to react.

**Badge assignment:**
- **Pass:** INP < 200ms
- **High Value:** INP 200–500ms
- **Critical:** INP > 500ms

**Note:** Many simple static and Squarespace sites show "INP: N/A" in PageSpeed — this means the tool captured insufficient interaction data during its lab test. Record "INP not captured in lab test (N/A)" and badge as Pass with a note. INP is primarily measurable from real user traffic in Google Search Console.

**Record:** INP value from PageSpeed (or "N/A — insufficient lab data"), badge

---

### B_GBP1 — Google Business Profile Quality

> This check evaluates the listing itself, not just whether a link to it exists. For local businesses, the GBP map pack frequently generates as many leads as the website. A listing with missing hours, no photos, or no recent activity ranks lower and is clicked less than a complete, active listing.

**How to find the listing:**
1. Use the Google Maps link from the site's LocalBusiness schema `sameAs` array (captured in B_AI1)
2. Or search Google for the business name + city — the Knowledge Panel on the right is the GBP listing

Score these five signals. The full check takes 3–5 minutes:

| Signal | Pass condition |
|---|---|
| Hours complete | Business hours filled in for all operating days — not "Hours not available" or blank |
| Business description | A description is present with at least 1–2 sentences about what the business does |
| Photos | At least 5 photos uploaded by the owner (exterior, interior, work samples, team) |
| Reviews with response | At least 5 reviews total; owner has replied to at least the most recent review |
| Recent post | A GBP post (update, offer, or event) published within the last 90 days |

**Badge assignment:**
- **Pass:** 5/5 or 4/5 signals met
- **High Value:** 2/5 or 3/5 signals met
- **Critical:** 0/5 or 1/5 signals met; OR the business has no claimed GBP listing at all

**No GBP listing found:** If the sameAs array has no Google Maps URL and a Google search for the business name produces no Knowledge Panel, flag as **Critical** — the business either has not created a GBP listing or has not claimed it. Note this clearly: appearing in the map pack requires a claimed and verified listing. Unverified listings suppress map pack placement entirely.

**Impact copy for High Value:** "Google Business Profile is the most direct ranking signal for 'near me' and local city searches. A listing missing hours, photos, or recent activity tells both Google's ranking algorithm and potential customers that the business is not actively maintained — which suppresses map pack placement and lowers the click rate on listings that do appear."

**Impact copy for Critical (no listing):** "Your business has no Google Business Profile listing, which means it cannot appear in Google Maps results or the local search panel. The map pack — the three local businesses shown above all organic results — drives a significant share of local service leads. Without a claimed and verified listing, you are invisible in that placement entirely."

**Record:** score (e.g., "3/5"), which signals pass and fail, any notable gaps (e.g., "last GBP post was November 2024"), badge

---

### B_GBP2 — NAP Consistency Across Citations

**NAP = Name, Address, Phone.** When these three data points differ between directories — Google says "123 Main St," Yelp says "123 Main Street Suite 100," Facebook says "123 Main" — Google's local ranking algorithm treats each version as a potentially distinct business. Inconsistency is a documented local pack ranking suppressor and the first thing any local SEO professional checks.

**Step 1 — Establish the canonical NAP from the website:**

Extract from the homepage footer, Contact page, or LocalBusiness schema:
- Exact business name (character-for-character, including "Co.", "LLC", punctuation)
- Full address including suite/unit number if applicable
- Phone number (note the format the business itself uses)

**Step 2 — Visit each citation source and record the exact Name / Address / Phone:**

Check these in order:
1. Each sameAs URL from the LocalBusiness schema (already verified in B_AI1)
2. Yelp — search `yelp.com` for the business name + city
3. Bing Places — search `bingplaces.com` for the business

For each directory, note the Name, Address, and Phone exactly as displayed (do not normalize — "St." vs "Street" is a meaningful discrepancy).

**Step 3 — Flag discrepancies:**

Any field that differs from the canonical NAP — missing suite number, abbreviated business name, different phone format, old address — is a discrepancy. Discrepancies accumulate; even small ones compound.

**Badge assignment:**
- **Pass:** NAP matches exactly (or with trivially equivalent abbreviation such as "TX" vs "Texas") across all checked directories
- **High Value:** One or more directories show a meaningful discrepancy (different address format, missing suite, alternate business name, different phone number)
- **Critical:** Multiple directories show contradictory NAP; OR a directory lists a former address or disconnected phone number

**Impact copy for High Value:** "When Google sees your business listed as '[Name A]' at '[Address A]' on your website, but as '[Name B]' at '[Address B]' on Yelp, it has lower confidence these are the same business — and lower confidence means lower local pack ranking. Correcting these citations is one of the highest-leverage local SEO actions a small business can take, and each correction is a one-time fix that pays dividends indefinitely."

**Record:** canonical NAP established from the website, each directory checked with exact Name/Address/Phone found, specific discrepancies flagged, badge

> **If no sameAs links exist:** Run this check using Google, Yelp, and Bing regardless. The findings inform both the NAP remedy and the sameAs array in the schema deliverable.

---

> **Checkpoint — write all B-check findings to intake progress file before wrapping up.**
> Use B-numbers consistently (B01, B05, B_AI1, etc.). Include the badge and any specific value found.
> This is the final checkpoint. The progress file should now contain every check's badge and key finding.

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

1. **Review B-check and Exploration Pass findings** — confirm every observation has a B-number (table checks keep their numbers; exploration discoveries are B23+), and confirm the progress file has an explicit Exploration Pass line (findings or "no additional findings")
2. **Score tally** — count by badge type: Critical / High Value / Pass / Nice to Have
3. **Priority selection** — include ALL Critical findings and ALL High Value findings. There is no cap. If you found 4 Criticals and 14 High Values, all 18 go in the list. All Criticals first, then all High Values. Two checks may share one entry only when their fix steps are literally identical (e.g., C04_1 and C04_2 sharing one entity graph remedy).
4. **Write executive summary** — 2–3 sentences covering the overall state and the most urgent theme
5. **List standalone deliverables** — any code blocks (JSON-LD, robots.txt content, meta tag snippets) that will be included in the Remedy Package

Then generate the JSON data file per `templates/audit-data-schema.json` and run the pipeline.

> **If context is running low:** Read `audit-tool/[client-slug]-intake-progress.md` to reconstruct any findings that have been compressed out of context before writing the JSON. The progress file is the source of truth — not memory.

---

## Quick Reference — Pipeline After Audit

```
Playwright audit → findings recorded
        ↓
Generate: [client-slug]-audit-data-[month]-[year].json
        ↓  node scripts/fill-template.mjs [data-file] --pdf
Generate: [client-slug]-pro-diagnosis-[month]-[year].html
   then automatically: [Client-Slug]-Remedy-Package-[Month]-[Year].pdf
        ↓  present to Joe for review
        ↓  on approval: node --env-file=.env scripts/send-delivery.mjs --to [email] --name "[name]" --pdf "[pdf-file]"
Delivered to client
        ↓  node scripts/archive-audit.mjs [data-file]
Session artifacts archived, audit-tool/ and repo root verified clean
```

(The two-step form still works: omit `--pdf` and fill-template prints the `generate-audit-pdf.mjs` command to run next.)

---

*Sequel Web Studio · sequelwebstudio.com*
