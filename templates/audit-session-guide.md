# Live Audit Session Guide
## Pro Diagnosis + Remedy Package — Sequel Web Studio

> **How to use this:** Open this file alongside your browser at the start of every audit. Work through the sections in order. Record every finding in the intake sheet as you go — don't wait until the end.

---

## Before You Start

**What to have ready:**

1. Client's website URL and platform (ask before the session if unknown)
2. A copy of the intake sheet, renamed for this client:
   - Copy `templates/audit-intake-sheet-template.md`
   - Save as `[client]-audit-intake-[month]-[year].md` in the project root
   - Fill in the header fields (client name, URL, platform, date)

**Tools — open these tabs before checking anything:**

| Tool | URL | Used for |
|---|---|---|
| Client's homepage | (client URL) | Visual inspection, source view |
| Google PageSpeed Insights | pagespeed.web.dev | Performance, image optimization, third-party scripts |
| Google Rich Results Test | search.google.com/test/rich-results | Schema validation |
| BuiltWith (optional) | builtwith.com | Platform identification |

**Keyboard shortcuts you'll use constantly:**

- `Ctrl+U` — View page source
- `Ctrl+F` — Find in source (use to locate tags quickly)
- `F12` — Browser DevTools (Elements tab, Network tab)
- `Ctrl+Shift+I` — DevTools (alternative)

---

## Phase 1 — Platform Identification (Check 27 first)

Do this before anything else — the platform determines how to interpret almost every other finding.

**Check 27 — Website Builder / Platform**

View page source and look for:
- `squarespace.com` in script/CSS URLs → **Squarespace**
- `wp-content/` or `wp-includes/` in URLs → **WordPress**
- `wix.com` or `static.wixstatic.com` → **Wix**
- `webflow.io` or `webflow.com` → **Webflow**
- `shopify.com` in URLs → **Shopify**
- Custom/unknown — note what you see (hosting provider, JS framework hints)

Record in intake sheet: platform name + any version hints found.

---

## Category 01 — SEO Fundamentals

**View page source (`Ctrl+U`) and search (`Ctrl+F`) for each:**

### Check 1 — Page Title Tag
Search for: `<title`

- Good: Descriptive, 50–60 characters, includes business name + primary keyword
- Bad: Default CMS title ("Home | Site Title"), too short, cut off, missing
- Copy the exact title text into the intake sheet

### Check 2 — Meta Description
Search for: `name="description"`

- Good: 120–160 characters, plain-English summary, includes a soft CTA
- Bad: Missing entirely, duplicate of title, too short (under 70 chars), too long (truncated in SERPs)
- Copy the exact content value into the intake sheet

### Check 3 — Canonical Tag
Search for: `rel="canonical"`

- Good: `<link rel="canonical" href="https://www.example.com/">` pointing to the page's own preferred URL
- Bad: Missing, pointing to wrong URL, pointing to http:// on an https:// site
- Note the exact href value

### Check 4 — Robots Meta Tag
Search for: `name="robots"`

- Good: `<meta name="robots" content="index, follow">` — or absent (absence = index/follow by default)
- Bad: `noindex` or `nofollow` on a page that should be indexed
- If present, copy the exact content value

### Check 5 — Heading Structure
Switch to DevTools Elements tab (F12). Expand `<body>` and look for `<h1>`, `<h2>`, `<h3>`.

Or search source for `<h1`, `<h2`, `<h3`.

- Good: One `<h1>` per page, logical `<h2>` / `<h3>` hierarchy, headings describe content
- Bad: Multiple `<h1>` tags, `<h3>` used before any `<h2>`, headings used for styling only, no `<h1>` at all
- Note the actual `<h1>` text

### Check 6 — Inner Page Canonicals
Navigate to 2–3 inner pages (Services, About, Contact). On each, view source and search for `rel="canonical"`.

- Good: Each page has its own canonical pointing to itself
- Bad: All pages canonical back to the homepage, missing on inner pages

---

## Category 02 — Social Sharing & Open Graph

**Back on the homepage source (`Ctrl+U`). Search for `og:`**

### Check 7 — OG Image
Search for: `og:image`

- Good: `<meta property="og:image" content="https://...">` with an absolute URL to an image (1200×630 recommended)
- Bad: Missing, relative URL, image URL returns 404, wrong dimensions

### Check 8 — Open Graph Tags
Search for each:
- `og:title` — should differ from page `<title>` if needed
- `og:description` — typically same as meta description
- `og:url` — should match canonical URL
- `og:type` — typically `website`

Note which are present and which are missing.

### Check 9 — Twitter Cards
Search for: `twitter:`

- Look for `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Good: `twitter:card` at minimum (usually `summary_large_image`)
- Bad: Completely missing (social previews will fall back to OG tags — acceptable, but note it)

---

## Category 03 — Performance & Page Speed

**Run PageSpeed Insights on the homepage now** (pagespeed.web.dev). Use **Mobile** tab first — it's the harder score.

Wait for results before continuing. While it runs, keep going with Category 02 if not done.

### Check 10 — TTFB (Time to First Byte)
In PageSpeed results, expand "Reduce initial server response time" if present.

- Good: Under 600ms
- Warning: 600ms–1500ms
- Bad: Over 1500ms (flag as Critical if over 2s)
- Note the actual ms value

### Check 11 — Total Load Time / LCP
Look at the **LCP (Largest Contentful Paint)** metric.

- Good: Under 2.5s
- Warning: 2.5s–4.0s
- Bad: Over 4.0s
- Note the actual value and what element is the LCP

### Check 12 — Image Optimization
Look for "Properly size images", "Serve images in next-gen formats", "Efficiently encode images" in diagnostics.

- Note total image savings if shown (e.g., "Potential savings of 450 KiB")
- Check what format images are in (JPEG/PNG = flag; WebP/AVIF = good)

### Check 13 — Third-Party Services Impact
Look for "Reduce the impact of third-party code" in diagnostics.

- Note which third-party scripts are present and their total blocking time
- Common culprits: Booking widgets, live chat, social feed embeds, old analytics tags

### Check 14 — Script Loading
Look for "Eliminate render-blocking resources" in diagnostics.

- Note any render-blocking scripts or stylesheets flagged
- Check source for `<script>` tags without `async` or `defer` in `<head>`

---

## Category 04 — Schema & Structured Data

**Run the Google Rich Results Test** (search.google.com/test/rich-results) on the homepage.

### Check 15 — Structured Data Presence
In source, search for: `application/ld+json`

- Note what @type values are present (LocalBusiness, WebSite, BreadcrumbList, etc.)
- Note if no structured data is found at all

### Check 16 — Schema Connectivity
In any JSON-LD blocks found, look for `@id` properties and `sameAs` arrays.

- Good: Blocks linked to each other via `@id`, `sameAs` pointing to Google Business Profile, social profiles
- Bad: Isolated blocks with no links, placeholder values left in

### Check 17 — Rich Result Types
In the Rich Results Test results, check which rich result types are detected vs. eligible but missing.

- Common wins available: FAQPage, LocalBusiness, BreadcrumbList, Review/AggregateRating (if they have reviews)

---

## Category 05 — Analytics & Tracking Integrity

**View page source. Search for `gtag` or `G-`**

### Check 18 — GA4 / Analytics Present
Look for: `gtag('config', 'G-XXXXXXXXXX')` or a Google Tag Manager snippet.

- Note the GA4 ID (G-XXXXXXXXXX) found
- Check if GTM is used instead — note the GTM-XXXXXXX ID

### Check 19 — Duplicate Pixel Firing
Search source for the GA4 ID or GTM ID — count how many times it appears.

**Platform-specific duplicate sources:**
- **Squarespace:** Settings > Analytics might have GA4 set, AND Code Injection might have a second copy. Two sources = duplicate.
- **WordPress:** Multiple analytics plugins can fire the same tag (e.g., MonsterInsights + manual GA4 snippet).
- Also check PageSpeed Insights for duplicate Google Analytics entries in third-party audit.

Flag as Critical if the same tag loads twice.

### Check 20 — Third-Party Inventory
From PageSpeed Insights "Reduce the impact of third-party code" and a source scan — list every third-party script domain found.

Common inventory:
- Google Analytics / GTM
- Google Fonts
- Facebook Pixel
- HotJar / Clarity
- Booking/scheduling widgets (Acuity, Calendly, etc.)
- Live chat (Intercom, Drift, etc.)
- Review widgets (Birdeye, Podium, etc.)

Note all present — this is informational, not automatically a fail.

---

## Category 06 — Security & Crawlability

### Check 21 — Robots.txt
Navigate directly to: `[client-url]/robots.txt`

- Good: File exists, `User-agent: *` with no problematic `Disallow` rules, sitemap URL referenced
- Bad: Returns 404, blocks entire site (`Disallow: /`), blocks important paths incorrectly
- Copy the full contents into the intake sheet

### Check 22 — HTTPS / SSL
Look at the browser address bar on every page visited.

- Good: Padlock icon, `https://` throughout
- Bad: "Not Secure" warning, padlock with warning icon, mixed content warning in DevTools console

### Check 23 — External Link noopener
In source, search for: `target="_blank"`

- For every external link that opens in a new tab, it should also have `rel="noopener noreferrer"` (or at minimum `rel="noopener"`)
- Bad: `<a href="..." target="_blank">` with no `rel` attribute

### Check 24 — llms.txt
Navigate to: `[client-url]/llms.txt`

- Good: File exists and describes the site's content and purpose for AI crawlers
- Bad: 404 (file missing — this is a "Nice to Have" item and a natural upsell for Sequel Web Studio)

---

## Category 07 — Accessibility

### Check 25 — Image Alt Text
In source, search for: `<img`

- For each `<img>` tag, check for an `alt` attribute
- Good: Every image has a descriptive `alt` text; decorative images have `alt=""`
- Bad: Missing `alt` attributes, `alt="image"` or `alt="photo"` (non-descriptive), `alt` filled with keywords (keyword stuffing)
- Note approx. how many images are missing alt text

### Check 26 — HTML Lang Attribute
In source, look at the opening `<html` tag.

- Good: `<html lang="en">` (or appropriate language code)
- Bad: `<html>` with no `lang` attribute

---

## Category 08 — Platform & AI Discoverability

### Check 27 — Platform (already done above)
Confirm what you found in Phase 1. No additional work needed.

### Check 28 — AI-Powered Search Readiness
This is a holistic judgment based on what you've found. Consider:

- Is there clear, structured content on the homepage that describes what the business does?
- Is there JSON-LD structured data (LocalBusiness + WebSite minimum)?
- Is there an llms.txt? (Check 24)
- Does the site have consistent NAP (Name, Address, Phone) across pages?
- Would a search AI be able to accurately describe this business from the homepage content alone?

Record your assessment (Pass / Needs Work) and a brief note on what's missing.

---

## B-Checks — Common Additional Issues

Work through these after completing the standard 28. Not all will apply to every client.

| B# | How to check |
|---|---|
| **B01** — Mobile viewport meta | Source: search `name="viewport"` |
| **B02** — Mobile layout issues | Resize browser to 375px wide (DevTools device toolbar), check for overlap or cutoff |
| **B03** — HTTP → HTTPS redirect | In browser address bar, type `http://[client-url]` — does it auto-redirect to https? |
| **B04** — Non-www → www redirect | Type `http://[client-url]` without www — does it resolve correctly? |
| **B05** — 404 page quality | Navigate to `[client-url]/this-page-does-not-exist` — is the 404 page helpful? |
| **B06** — Sitemap accuracy | Navigate to `[client-url]/sitemap.xml` — does homepage URL match canonical? Any staging/draft URLs? |
| **B07** — Draft pages in sitemap | Scan sitemap for `/draft/`, `/test/`, `/staging/`, or password-protected pages |
| **B08** — Cookie consent / GDPR | Reload homepage in a fresh private window — does a cookie banner appear? |
| **B09** — Privacy policy linked | Check footer for a Privacy Policy link |
| **B10** — Physical address on homepage | Scan homepage for street address — is NAP (Name, Address, Phone) present? |
| **B11** — Phone number format | Check that phone number is consistently formatted and clickable (`tel:` link on mobile) |
| **B12** — Social media completeness | Look for social links in header/footer — are all active profiles linked? Any dead links? |
| **B13** — Embedded map on Contact | Navigate to Contact page — is there a Google Map embed? |
| **B14** — Web form on Contact | Is there a contact form, or only email/phone? |
| **B15** — Inner page title quality | Check 3–4 inner page titles — unique, descriptive, right length? |
| **B16** — Missing page-specific schema | FAQ page without FAQPage schema, Services page without Service schema, etc. |
| **B18** — Developer artifacts in source | Source: look for TODO comments, `console.log`, staging URLs, commented-out blocks |
| **B19** — Favicon formats | Check `<link rel="icon"` in source — is it just `.ico` or also `.png`/`.svg`/`apple-touch-icon`? |
| **B20** — Copyright year in footer | Is the footer copyright year current? |

---

## Platform-Specific Notes

### Squarespace

**Where settings live:**
- SEO fields: Pages panel → click the page → click the gear icon → SEO tab
- Analytics/GA4: Settings → Analytics OR Settings → Advanced → External Services
- Code Injection: Settings → Advanced → Code Injection (header/footer)
- Schema: Squarespace adds minimal LocalBusiness schema automatically — check /sitemap.xml for what it generates

**Common Squarespace issues:**
- **Duplicate GA4:** Tag in Settings → Analytics AND again in Code Injection header. Very common. Flag Critical.
- **Draft pages in sitemap:** Published test/draft pages appear at /sitemap.xml. Flag High Value.
- **No OG image customization by page:** Squarespace uses the social image set at the page level (gear → social image). If not set, it uses the site-wide default or nothing.
- **Missing meta descriptions:** Squarespace doesn't auto-generate them. Must be set per page.
- **robots.txt:** Squarespace auto-generates this. Check it; it occasionally blocks things unnecessarily.

### WordPress

**Where settings live (depends on plugins):**
- With Yoast SEO: SEO menu in left sidebar → most SEO fields there
- With RankMath: RankMath menu in left sidebar
- Without either: Settings → Reading (for basic indexing), theme header for meta tags (inconsistent)

**Common WordPress issues:**
- **Multiple SEO plugins active simultaneously:** Causes duplicate meta tags. Common when a site changed plugins and both are still active.
- **Default robots.txt blocking search engines:** Settings → Reading has a "Discourage search engines" checkbox that is sometimes left checked.
- **No OG images without a plugin:** Core WordPress doesn't add OG tags — requires Yoast, RankMath, or a dedicated OG plugin.
- **Slow TTFB on shared hosting:** Very common. Flag and note the host if visible in source or response headers.
- **Plugin bloat visible in source:** Count the number of scripts in `<head>`. More than 15–20 is a signal.

### Wix

**Where settings live:**
- SEO: Site & App → SEO Tools, or individual page Settings → SEO Basics
- Analytics: Site & App → Marketing Integrations

**Common Wix issues:**
- **JavaScript-heavy = slow TTFB:** Wix pages are largely JS-rendered. TTFB over 2s is typical on Wix.
- **Limited structured data control:** Wix adds some schema automatically; custom JSON-LD requires Wix Velo (developer mode).
- **URL structure:** Wix URLs are sluggish and not always editable. Note any `/page/` or odd URL formats.
- **robots.txt:** Wix auto-generates. Check it.

### Webflow

**Common Webflow issues:**
- Clean HTML and good semantic structure — usually better than average
- Large exported JS bundles can hurt performance
- SEO settings per-page in the Designer (Pages panel → page settings)
- Schema: Webflow doesn't add structured data automatically — almost always missing

---

## Wrapping Up the Session

Once all checks are complete:

1. **Review B-checks for any additional numbered items** (B23, B24, etc.) for anything found that didn't fit an existing B-number — assign new B-numbers in sequence.

2. **Score tally** — count your findings by badge type and fill in the intake sheet score grid:
   - Critical (must fix — impacts ranking, trust, or conversion)
   - High Value (significant improvement available)
   - Pass (no action needed)
   - Nice to Have (low priority improvement)

3. **Tentative priority selection** — looking at all Critical and High Value findings, mark the ones with the highest business impact for the Priority Action List. Typical range is 5–12; aim for what genuinely moves the needle most for this client's situation.

4. **Save the intake sheet.** The audit session is done. The next step is handing the completed intake sheet to Claude to produce the JSON data file, then running the pipeline to generate the PDF.

---

## Quick Reference — Pipeline After Session

```
1. [client]-audit-intake-[month]-[year].md   ← you filled this in
        ↓  (Claude reads intake sheet, produces JSON)
2. [client]-audit-data-[month]-[year].json
        ↓  node scripts/fill-template.mjs [client]-audit-data-[month]-[year].json
3. [client]-pro-diagnosis-[month]-[year].html
        ↓  node scripts/generate-audit-pdf.mjs [client]-pro-diagnosis-[month]-[year].html
4. [Client-Name]-Remedy-Package-[Month]-[Year].pdf   ← client deliverable
```

Run the QA checklist (`templates/audit-qa-checklist.html`) before sending.

---

*Sequel Web Studio · sequelwebstudio.com*
