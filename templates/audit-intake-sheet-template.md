# Pro Diagnosis + Remedy Package — Audit Intake Sheet
## [CLIENT_NAME] · [SITE_URL] · [AUDIT_DATE]

> **How to use this sheet:**
> 1. Fill in Section 0 (header) before starting the audit.
> 2. Work through Section 1 check by check during the live audit session.
> 3. After all checks are complete, fill in Section 2 (priority selection).
> 4. Fill in Section 3 (remedy steps) for each selected priority item.
> 5. Count the score tally in Section 4, then write the exec summary in Section 5.
> 6. List any standalone deliverables (code blocks) in Section 6.
> 7. Hand this completed sheet to Claude to build the HTML deliverable.

---

## SECTION 0 — Client Header

| Field | Value |
|---|---|
| Client / Business Name | |
| Site URL (domain only, e.g. acmeplumbing.com) | |
| Full Site URL (e.g. https://www.acmeplumbing.com) | |
| Platform / CMS | |
| Audit Date (e.g. May 15, 2026) | |
| Audit Month + Year (e.g. May 2026) | |
| Total Checks Run | (fill after audit: 28 standard + ___ bonus) |

---

## SECTION 1 — Audit Findings

**Badge options:** `Critical` · `High Value` · `Pass` · `Nice to Have`
**In Remedy Package?** Fill this in during Section 2 — leave blank for now.

---

### CATEGORY 01 — SEO Fundamentals

#### C01-1: Page Title Tag (Your Website's Name in Google)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C01-2: Meta Description (Your Google Elevator Pitch)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C01-3: Canonical Tag (Telling Google Which Version Is Official)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C01-4: Robots Meta Tag
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C01-5: Heading Structure (H1/H2/H3 Hierarchy)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C01-6: Inner Page Canonicals
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

---

### CATEGORY 02 — Social Sharing & Open Graph

#### C02-7: OG Image
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C02-8: Open Graph Tags (og:title, og:description, og:url, og:type)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C02-9: Twitter Cards
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

---

### CATEGORY 03 — Performance & Page Speed

#### C03-10: TTFB (Time to First Byte)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — include PageSpeed score)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C03-11: Total Load Time
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C03-12: Image Optimization
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C03-13: Third-Party Services Impact
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C03-14: Script Loading (JavaScript Render-Blocking)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

> **While PageSpeed Insights is still open:** Capture CLS and INP now — you will record them as B_CWV1 and B_CWV2 in the B-Checks section below. Both appear in the "Core Web Vitals" section of the mobile PageSpeed results.

---

### CATEGORY 04 — Schema & Structured Data

#### C04-15: Structured Data Presence (LocalBusiness, WebSite, etc.)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — paste schema output or Rich Results Test result)*
- **Code Block Deliverable:** [ ] Yes — JSON-LD to include in report  [ ] No
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C04-16: Schema Connectivity & sameAs Authority Links (blocks linked via @id, verified directory URLs)
- **Badge:** *(High Value if sameAs missing or < 2 verified directory URLs; Pass if Google Maps + 1 other present AND @id linking in place)*
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(list all sameAs URLs found; note which ones you verified load the correct business)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No *(usually shares same item # as C04-15)*

#### C04-17: Rich Result Types Available But Missing
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

---

### CATEGORY 05 — Analytics & Tracking Integrity

#### C05-18: Analytics & Measurement Coverage
- **Badge:**
- **Found:** *(vendor-agnostic — record ALL measurement detected: network beacons fired, third-party tags (Google/Meta/Amazon/etc.), first-party analytics scripts, and platform-native dashboards. Never write "no analytics" from a client-side scan.)*
- **Business Impact:**
- **Technical Detail:** *(optional — tag IDs, beacon endpoints, first-party script names)*
- **Scope caveat noted?** [ ] Yes — client-side only; server-side, off-site, and other subdomains not visible
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C05-19: Duplicate / Over-Firing Tags
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — occurrence count per tag from the network log)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C05-20: Tracking Inventory (Third-Party + First-Party)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — list scripts found)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

---

### CATEGORY 06 — Security & Crawlability

#### C06-21: Robots.txt (What's Blocked)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — paste key lines)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C06-22: HTTPS / SSL
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C06-23: External Link noopener Attribute
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C06-24: llms.txt (AI Discoverability File)
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **Code Block Deliverable:** [ ] Yes — llms.txt content to include  [ ] No
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

---

### CATEGORY 07 — Accessibility

#### C07-25: Image Alt Text
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — note specific images missing alt text)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C07-26: HTML Lang Attribute
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

---

### CATEGORY 08 — Platform & AI Discoverability

#### C08-27: Website Builder / Platform Identification
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### C08-28: AI Citation Readiness (5-Signal Score)
- **Badge:** *(Pass = 4–5/5; High Value = 2–3/5; Critical = 0–1/5)*
- **Score:** \_\_\_ / 5
- **Signal 1 — LocalBusiness schema with complete data:** [ ] ✓  [ ] ✗
- **Signal 2 — sameAs links to 2+ authoritative directories:** [ ] ✓  [ ] ✗
- **Signal 3 — llms.txt present with substantive content:** [ ] ✓  [ ] ✗
- **Signal 4 — FAQPage schema present:** [ ] ✓  [ ] ✗
- **Signal 5 — Static readable text describing the business:** [ ] ✓  [ ] ✗
- **Found:** *(list which signals pass and which fail)*
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] No *(this is a summary — individual gaps have their own remedy items)*

---

### EXPLORATION PASS (mandatory — complete before the B-check table)

Browse the site like a prospective customer: homepage, every top-nav page, the contact page, and 1–2 service/product inner pages — once at desktop width, once at 375px mobile. Record every noteworthy observation (copy, CTAs, trust signals, broken things, images, UX — anything) as a new B-check entry below, numbered B23 and up. Genuine strengths may be recorded as Pass entries.

| Page visited | Desktop ✓ | 375px ✓ |
|---|---|---|
| | | |
| | | |
| | | |
| | | |
| | | |

- [ ] Homepage screenshot taken at both widths
- [ ] Every observation recorded as a B-entry below — or "nothing noteworthy" explicitly noted here: \_\_\_\_\_\_\_\_\_\_

---

### ADDITIONAL DIAGNOSTICS (B-Checks)

Add a B-check entry for each issue found outside the standard 28. **The reference list is a floor, not a ceiling:** run every listed check unless it is structurally inapplicable to the site, and note why when one is skipped. Add new entries (B23+) for anything — from the Exploration Pass or otherwise — that doesn't fit an existing label.

*Reference list:*
B01 · Mobile Viewport Meta Tag · **B02 · Mobile Layout and CTA Above the Fold** · B03 · HTTP→HTTPS Redirect · B04 · Non-www to www Redirect · B05 · 404 Error Page Quality · B06 · Sitemap Accuracy · B07 · Duplicate/Draft Pages in Sitemap · B08 · Cookie Consent/GDPR · B09 · Privacy Policy Not Linked · B10 · Physical Address on Homepage · **B11 · Phone Number Tap-to-Call** · B12 · Social Media Completeness · B13 · Contact Page — No Map · **B14 · Contact Form Live Submission Test** · B15 · Inner Page Title Quality · B16 · Missing Page-Specific Schema · B17 · Mixed Content · B18 · Developer Artifacts · B19 · Favicon Formats · B20 · Copyright Notice · B21 · Video Content · B22 · hreflang Tags · **B_AI1 · sameAs Authority Links (AI identity verification)** · **B_AI2 · FAQPage Schema from Site FAQ Content** · **B_CWV1 · Cumulative Layout Shift (CLS)** · **B_CWV2 · Interaction to Next Paint (INP)** · **B_GBP1 · Google Business Profile Quality** · **B_GBP2 · NAP Consistency Across Citations** · **B_TRUST1 · Social Proof and Trust Signals** · **B_SVC1 · Service and Location Page Coverage** · **B_A11Y1 · Form Input Labels** · **B_A11Y2 · Keyboard Focus Visibility** · **B_A11Y3 · Color Contrast Spot-Check** · **B_A11Y4 · Link Text Quality**

---

#### B\_\_: [Check Name]
- **Badge:**
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **Code Block Deliverable:** [ ] Yes  [ ] No
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

*(Copy the block above for each B-check. Add new B-numbers beyond B22 for issues not on the reference list.)*

---

#### B_AI1: sameAs Authority Links — Is the Business Verifiable Across the Web?

> Run only if C04-15 found LocalBusiness schema. If no schema exists yet, this is folded into that remedy item.

- **Badge:** *(High Value if sameAs missing or < 2 verified directory URLs; Pass if Google Maps + 1 other verified)*
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(list each sameAs URL found and whether it loads the correct business listing)*
- **Code Block Deliverable:** [ ] Yes — updated schema block with corrected sameAs array  [ ] No
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### B_AI2: FAQPage Schema from Site FAQ Content

- **Badge:** *(High Value if FAQ content exists on site but no FAQPage schema; Nice to Have if no FAQ content found)*
- **FAQ content found on site:** [ ] Yes — describe where: \_\_\_\_\_\_\_\_\_\_  [ ] No
- **FAQPage schema present:** [ ] Yes  [ ] No
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(note how many Q&A pairs found and on which pages)*
- **Code Block Deliverable:** [ ] Yes — FAQPage JSON-LD block  [ ] No
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### B14: Contact Form Live Submission Test

> Navigate to the Contact page. Step 1: confirm form exists and note spam protection. Step 2: fill with test data (Name: "Website Audit Test", Email: joe@sequelwebstudio.com, Message: "Test from website audit — please disregard") and submit. Step 3: record the on-page response.

- **Form found on Contact page:** [ ] Yes  [ ] No
- **Spam protection detected (honeypot / captcha):** [ ] Yes  [ ] No
- **Submission result:** [ ] Clear success message  [ ] Redirect to thank-you page  [ ] Silent failure (no feedback)  [ ] Server error  [ ] Submit button non-functional
- **Badge:** *(Pass = exists + success response; High Value = exists but vague/no success message, or no spam protection; Critical = no form, silent failure, or broken submit)*
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — note the on-page response text verbatim)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### B_CWV1: Cumulative Layout Shift (CLS)

*(Capture from PageSpeed Insights mobile results while still open during Category 03.)*

- **CLS value:** \_\_\_\_\_\_\_ *(or "N/A — not reported")*
- **Badge:** *(Pass < 0.1; High Value 0.1–0.25; Critical > 0.25)*
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — note which elements are shifting, from PageSpeed diagnostics)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### B_CWV2: Interaction to Next Paint (INP)

*(Capture from PageSpeed Insights mobile results while still open during Category 03. If PageSpeed shows "N/A" or no INP value, record that — it typically means insufficient lab interaction data, not a failure.)*

- **INP value:** \_\_\_\_\_\_\_ ms *(or "N/A — insufficient lab data")*
- **Badge:** *(Pass < 200ms or N/A from lab; High Value 200–500ms; Critical > 500ms)*
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — note which interaction is slowest, from PageSpeed diagnostics)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### B_GBP1: Google Business Profile Quality

> Open the GBP listing via the sameAs Google Maps URL (from B_AI1) or by searching Google for the business name + city. Score each of the five signals below.

- **GBP listing found and claimed:** [ ] Yes  [ ] No *(if No: badge is Critical — stop here)*
- **Signal 1 — Hours complete:** [ ] ✓  [ ] ✗
- **Signal 2 — Business description present (1–2+ sentences):** [ ] ✓  [ ] ✗
- **Signal 3 — Photos ≥ 5 (owner-uploaded):** [ ] ✓  [ ] ✗
- **Signal 4 — Reviews ≥ 5, with owner response to most recent:** [ ] ✓  [ ] ✗
- **Signal 5 — GBP post within last 90 days:** [ ] ✓  [ ] ✗
- **Score:** \_\_\_ / 5
- **Badge:** *(Pass = 4–5/5; High Value = 2–3/5; Critical = 0–1/5 or no listing)*
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — note specific gaps, e.g., "last post: November 2024")*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### B_GBP2: NAP Consistency Across Citations

> Establish the canonical Name / Address / Phone from the website, then visit each sameAs URL + Yelp + Bing Places and record exactly what each shows.

- **Canonical NAP (from website):**
  - Name: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
  - Address: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
  - Phone: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

- **Citations checked:**

| Directory | Name as listed | Address as listed | Phone as listed | Match? |
|---|---|---|---|---|
| Google Maps | | | | [ ] ✓  [ ] ✗ |
| Yelp | | | | [ ] ✓  [ ] ✗ |
| Bing Places | | | | [ ] ✓  [ ] ✗ |
| Other (\_\_\_\_) | | | | [ ] ✓  [ ] ✗ |

- **Discrepancies noted:**
- **Badge:** *(Pass = all match; High Value = meaningful discrepancy in one or more directories; Critical = multiple contradictory entries or former address/disconnected phone)*
- **Found:**
- **Business Impact:**
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### B02: Mobile Layout and CTA Above the Fold

> Take a screenshot at 375px viewport width. Assess two things: (1) layout quality — does anything break, overflow, or overlap at mobile width? (2) CTA visibility — is a phone number or contact button visible in the first screen without scrolling?

- **Layout status at 375px:** [ ] No issues  [ ] Minor issues *(note: \_\_\_\_\_\_\_\_\_\_)*  [ ] Broken layout
- **CTA visible above the fold:** [ ] Tappable phone number  [ ] CTA button  [ ] Neither — buried below fold
- **Badge:** *(Pass = clean layout + visible CTA above fold; High Value = clean layout but no CTA above fold, or minor layout issues; Critical = broken layout or no CTA anywhere)*
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — note the first visible CTA element and its position)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### B11: Phone Number Tap-to-Call

> Run the tel: link query, then verify whether the phone number visually displayed in the header or hero is a tappable link or plain text.

- **tel: links found:** [ ] Yes — count: \_\_\_  [ ] None
- **Header/hero phone is a tap-to-call link:** [ ] Yes  [ ] No — plain text only  [ ] No phone visible in header
- **Badge:** *(Pass = header phone is a tel: link; High Value = phone visible but plain text in header; Nice to Have = phone only in footer/Contact, not header)*
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### B_TRUST1: Social Proof and Trust Signals

> Check homepage and any services page during the Exploration Pass. Record every trust signal found.

- **Trust signals found (check all that apply):**
  - [ ] Client testimonials or quotes from named clients
  - [ ] Star rating or review count displayed (e.g., "★★★★★ 48 Google Reviews")
  - [ ] Google / Yelp / other review widget embedded
  - [ ] Trust badges (BBB, licensed & insured, certifications, industry awards)
  - [ ] Portfolio, case studies, or before/after photos
  - [ ] Years in business or client count mentioned
- **Location of trust signals:** [ ] Homepage above fold  [ ] Homepage below fold  [ ] Inner pages only  [ ] None found
- **Google reviews available but not shown on site:** [ ] Yes *(from B_GBP1: \_\_\_ reviews)*  [ ] No
- **Badge:** *(Pass = 2+ distinct signals on homepage; High Value = 1 signal or signals only on inner pages; Critical = no trust signals anywhere)*
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — note specific elements found or absent)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

#### B_SVC1: Service and Location Page Coverage

> Complete during the Exploration Pass. Navigate the services section and note how many distinct services the business offers vs. how many have individual dedicated pages.

- **Services identified from the site:**
  - \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
  - \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
  - \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
  - *(add more as needed)*
- **Individual service pages exist:** [ ] Yes — count: \_\_\_  [ ] No — single umbrella "Services" page only
- **Business serves multiple cities/areas:** [ ] Yes  [ ] No
- **Location/city-specific pages exist:** [ ] Yes  [ ] No  [ ] N/A (single-city business)
- **Badge:** *(Pass = individual pages per major service, or single-service business with a well-developed page; High Value = multiple services with no individual pages, or multi-city with no location pages; Critical = no service content at all)*
- **Found:**
- **Business Impact:**
- **Technical Detail:** *(optional — list specific service topics that lack dedicated pages)*
- **In Remedy Package:** [ ] Yes — Item #\_\_\_  [ ] No

---

## SECTION 2 — Priority Selection

> **⚠ MANDATORY RULE: Every Critical finding and every High Value finding MUST appear in this list. There is NO cap. If you found 9 Criticals and 15 High Values, all 24 items go in this table. Do not limit to 10 or any other number.**
>
> Two findings may share one row (and one remedy) only if the fix steps are literally identical. Example: "page title" and "inner page titles" share one remedy item because the fix is the same WordPress menu path. When in doubt, keep them separate.
>
> Order: all Criticals first, then all High Values.

| # | Check ID | Item Title (brief, plain English) | Badge |
|---|---|---|---|
| 1 | | | Critical |
| 2 | | | Critical |
| 3 | | | Critical |

*(Add one row for every Critical finding. Then continue with High Value rows below.)*

| # | Check ID | Item Title (brief, plain English) | Badge |
|---|---|---|---|
| (next #) | | | High Value |
| (next #) | | | High Value |
| (next #) | | | High Value |

*(Add one row for every High Value finding. No cap. Total rows = all Critical + all High Value findings from Section 1.)*

---

## SECTION 3 — Remedy Package

> Write the detailed remedy steps for each item selected in Section 2. These populate the Remedy Package section of the HTML deliverable. Steps should be specific to the client's platform and written so a non-technical person can follow them.
>
> **Shared remedy items:** When a single remedy item covers multiple checks (two or more checks share the same Item # in Section 2), write the Findings paragraph to acknowledge all covered checks — either describe each finding in a separate sentence or write a unified description that encompasses all of them. The build script will automatically prepend a disclosure note listing the check IDs; the Findings text should still be complete and specific for each covered check.

---

### REMEDY ITEM #1 — [TITLE]
**Badge:** Critical / High Value
**Source check:** [e.g. C01-1]

**Findings paragraph** *(1–3 sentences — exactly what was found, specific and factual):*


**Remedy steps** *(add or remove steps as needed — typical range 2–6):*
- Step 1:
- Step 2:
- Step 3:
- Step 4:
- Step 5:

**Standalone code deliverable?** [ ] Yes  [ ] No
- If yes — callout label (e.g. "Standalone Deliverable — LocalBusiness Schema"):
- If yes — code: *(paste below or note "see attached")*

---

### REMEDY ITEM #2 — [TITLE]
**Badge:** Critical / High Value
**Source check:** [e.g. C04-15]

**Findings paragraph:**


**Remedy steps:**
- Step 1:
- Step 2:
- Step 3:
- Step 4:
- Step 5:

**Standalone code deliverable?** [ ] Yes  [ ] No
- If yes — callout label:
- If yes — code:

---

### REMEDY ITEM #3 — [TITLE]
**Badge:** Critical / High Value
**Source check:**

**Findings paragraph:**


**Remedy steps:**
- Step 1:
- Step 2:
- Step 3:
- Step 4:
- Step 5:

**Standalone code deliverable?** [ ] Yes  [ ] No
- If yes — callout label:
- If yes — code:

---

*(Copy the block above — starting from "### REMEDY ITEM #N" — for each additional priority item.)*

---

## SECTION 4 — Score Tally

> Count badges across ALL findings (standard 28 + all B-checks). Each check gets exactly one badge.

| Badge | Count |
|---|---|
| Critical | |
| High Value | |
| Pass | |
| Nice to Have | |
| **Total checks** | |

---

## SECTION 5 — Executive Summary

> Write after everything else is filled in. This appears near the top of the report.

**Headline** *(one strong sentence summarizing the audit, e.g. "BSR Bike Shop's site has the bones of a good web presence — but several technical gaps are actively suppressing your search visibility and costing you leads."):*


**Body paragraph** *(2–4 sentences — overview of findings, what was strong, what needs work, what the client will have after the remedy):*


---

## SECTION 6 — Standalone Deliverables

> List every ready-to-use code block or file included in the report. These appear in the "What's Included" card. Leave blank if none.

| Reference Label (e.g. "Remedy · Item 4") | Description (what the deliverable is) |
|---|---|
| | |
| | |

---

## SECTION 7 — Build Checklist

> Check off before handing to Claude for HTML build.

- [ ] All 28 standard checks filled (badge + found + impact minimum)
- [ ] Exploration Pass completed — pages browsed at desktop + 375px, findings recorded as B-checks (or "nothing noteworthy" explicitly noted)
- [ ] All B-checks captured and numbered (every reference-list check run or skip reason noted)
- [ ] Section 2 priority table complete — items ranked, all Criticals first
- [ ] Every priority item has a matching remedy entry in Section 3
- [ ] Score tally adds up to total checks run
- [ ] Exec headline and body written
- [ ] Standalone deliverables listed (or confirmed none)
- [ ] Client header fields all filled (name, URL, platform, date)
