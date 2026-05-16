# Sequel Web Studio — Project Context for Claude Code

> **READ THIS FIRST.** This file is the handoff packet from the planning phase to the build phase. It tells you what to build, what's already decided, what's already live, and what order to do things in. The authoritative spec is `Sequel Web Studio - Website PRD v2.docx`. This file is the "executive summary + ground truth" — the PRD is the detailed spec.

---

## 1. What this project is

**Sequel Web Studio** is a one-person small-business website company serving Northern Tarrant County, TX. The owner is Joe Weeks (joe@sequelwebstudio.com). This repo contains the company's own website at **sequelwebstudio.com**.

The site has three jobs:
1. **Convert visitors to leads** — small-business owners who need a website.
2. **Demonstrate competence** — the site itself is the portfolio piece.
3. **Run the audit tool** — an interactive page-speed/SEO audit that doubles as a lead magnet.

Joe is **non-technical**. Treat him as a stakeholder, not an engineer. When you ship code, explain what you did in plain English, not in jargon.

---

## 2. Current live state (do not break)

- **Domain**: sequelwebstudio.com (Namecheap, 2-year term, WhoisGuard on, auto-renew on)
- **DNS**: Namecheap-managed (per decision D2). A record at `@` and CNAME at `www` point to Netlify.
- **Hosting**: Netlify
- **Live now**: A static "Coming Soon" page in `/coming-soon/index.html` is currently deployed. It uses Joe's brand palette and a mailto link to joe@sequelwebstudio.com. **Do not delete this folder until the real site replaces it on the same Netlify deployment.**
- **SSL**: Let's Encrypt via Netlify (automatic).

---

## 3. Tech stack (decided — do not re-litigate)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro** (static-first, islands for interactivity) | Fast, SEO-friendly, works on Netlify out of the box |
| Styling | Tailwind CSS | Fast, no design system overhead |
| Backend | Netlify Functions (Node) | No separate server, free tier covers this |
| Data store | **Google Sheets via Netlify Functions + service account** (D7) | Lightweight, free, Joe can see/edit the data directly |
| Forms | Native `<form>` posting to Netlify Function | Avoids vendor lock-in |
| Bot prevention | **Cloudflare Turnstile + honeypot** (D10) | Free, no friction |
| Analytics | GA4 with consent mode v2 | Standard, free |
| Cookie banner | **CookieYes** (free tier) | GDPR/CCPA-ready, integrates with GA4 consent |
| Email | Google Workspace → MailMeteor for outreach | (Workspace not yet provisioned — see Section 7) |
| Domain | Namecheap | Existing relationship |

---

## 4. Brand & visual

- **Palette** (full four-color, per D14 — Joe deviated from the recommended simplified palette; revisit at first design review if purple feels heavy):
  - Navy `#1F3864` — primary, headings, nav
  - Blue `#2E75B6` — secondary, links, CTAs
  - Purple `#8E44AD` — accent only (small touches: section dividers, callouts, tag highlights)
  - Grey `#595959` — body text
  - Background `#F7F8FA`
- **Typography**: System font stack for body (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`). Use a serif for headings only if it tests well — start with sans.
- **Logo**: Not yet designed. For now, use the wordmark "Sequel Web Studio" in navy, weight 700. Reserve the favicon slot — current placeholder is the "S" mark in the Coming Soon page's inline SVG favicon.
- **Headshot**: `Joe-headshot.PNG` is in the project root. Use it on the About page and as a social-proof element on the homepage.

---

## 5. Build phases — work in this order

### Phase 1 — Marketing site (do this first)
Replaces the Coming Soon page. All static, no backend yet.

- Homepage (hero, value prop, services, social proof, CTA, footer)
- Services page (or section) — what Joe does + pricing tiers
- About page — Joe's story + headshot
- Contact page — form (Netlify-hosted, Turnstile-protected)
- Privacy page (PRD §7.7) — required for GA4/CookieYes compliance
- 404 page
- llms.txt at root (PRD §13)
- Schema.org JSON-LD on every page (LocalBusiness type)
- Sitemap.xml (Astro plugin)
- Robots.txt allowing all crawlers including AI bots (GPTBot, ClaudeBot, etc. — per PRD §13)

**Phase 1 ships when**: site replaces Coming Soon at sequelwebstudio.com, Lighthouse scores ≥95 across the board, contact form delivers a test submission.

**Homepage copy is approved and locked.** It lives in `Sequel Web Studio - Homepage Copy.md` at the project root. Use it verbatim — eight sections, in order, with the audit URL field in both Section 4 and Section 8 wired to the same backend endpoint (a single reusable component). Do not rewrite or summarize the copy without Joe's approval.

### Phase 2 — Audit tool
- Public audit page where a visitor submits their URL
- Netlify Function calls Google PageSpeed Insights API + scrapes basic on-page SEO signals
- Result page renders a scored audit
- Submission writes to the Google Sheet (lead capture)
- Daily email digest to Joe summarizing new leads (Apple Script or Google Apps Script — see PRD §11)

### Phase 3 — Lead nurture & polish
- Auto-response email after audit submission
- "Coming back to your audit" follow-up sequence (manual at first, MailMeteor)
- Case-study templates (when first projects ship)
- Open Graph images
- Performance pass

---

## 6. Decisions log — 15 items

Nine matched the recommended path. Six deviated. **Do not re-decide these.** If a deviation creates pain during build, flag it to Joe — don't silently switch.

### Matched recommended path
- **D1** Tech stack: Astro + Tailwind + Netlify Functions
- **D3** Repo: GitHub, public is fine for the marketing site
- **D4** CI/CD: Netlify auto-deploys from `main` branch
- **D6** Form handler: Netlify Function (not third-party form service)
- **D8** SEO baseline: Schema.org JSON-LD, sitemap, robots.txt, llms.txt
- **D9** AI crawler policy: allow all (GPTBot, ClaudeBot, PerplexityBot, etc.)
- **D11** Headshot: use existing `Joe-headshot.PNG`
- **D12** Performance budget: Lighthouse ≥95 mobile, ≥98 desktop
- **D15** Accessibility: WCAG 2.1 AA target

### Deviated (preserve recommended path for future revisit)
| # | Topic | Chosen | Recommended | Revisit when |
|---|---|---|---|---|
| D2 | Hosting/DNS | Netlify hosting + Namecheap DNS | Consolidate everything to Netlify DNS | 10+ sites in portfolio |
| D5 | Pricing | $1,000 starter / $2,000 premium (pilot through project #10) | $1,500 / $3,000 floors | Project #8–9 |
| D7 | Data store | Google Sheets via Netlify Functions | Supabase free tier | Sheets API rate limits or relational queries needed |
| D10 | Spam protection | Cloudflare Turnstile + honeypot | Honeypot only for v1 | Spam volume negligible after 60 days → simplify |
| D13 | Phone on site | Joe's personal cell, public | Google Voice forwarding | Spam/after-hours calls become a problem |
| D14 | Palette | Full 4-color (navy/blue/purple/grey) | Simplified 3-color (drop purple) | First design review |

---

## 7. Things that aren't ready yet (don't block on these)

- **Google Workspace** — Joe is buying this later. Until then, contact email everywhere is `joe@sequelwebstudio.com`. **Make this a single source-of-truth constant** in the codebase (e.g., `src/config/site.ts` exporting `CONTACT_EMAIL`) so it's a one-line swap when Workspace lands.
- **SPF/DKIM/DMARC** — depends on Workspace. Not blocking the marketing site.
- **GA4 property** — Joe will create. Wire the loader behind a `PUBLIC_GA4_ID` env var that's empty for now; the loader should no-op when the var is empty.
- **CookieYes account** — same pattern: env-var-gated.
- **Google Sheet (data layer)** — needed for Phase 2, not Phase 1. Joe will provision when we get there.
- **Service account for Sheets** — needed for Phase 2.

---

## 8. Coding conventions

- **TypeScript everywhere.** No plain JS files except config.
- **No localStorage / sessionStorage** in browser code unless absolutely required (we are not building an authenticated app).
- **Single-source constants** in `src/config/`. Anything that might change (email address, phone, social links, GA4 ID) lives there.
- **Components**: small, named, in `src/components/`. Astro components by default; React island only when interactivity is needed.
- **Accessibility from the start**: semantic HTML, alt text on every image, form labels, focus styles, keyboard nav. Don't bolt this on at the end.
- **No analytics, no third-party scripts, until cookie consent is granted.** Consent mode v2 default state is "denied"; flip to "granted" only on user opt-in.
- **Comments**: explain *why*, not *what*. The code already says what.

---

## 9. Environment variables

Create `.env.example` in the repo root with these keys (values empty/placeholder). Joe will populate the real `.env` (and Netlify env config) when each piece comes online.

```
PUBLIC_SITE_URL=https://sequelwebstudio.com
PUBLIC_CONTACT_EMAIL=joe@sequelwebstudio.com
PUBLIC_GA4_ID=
PUBLIC_COOKIEYES_ID=
PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_KEY=
PAGESPEED_API_KEY=
```

**Never commit `.env`.** Add it to `.gitignore` immediately.

---

## 10. Deployment

- **Auto-deploy**: connect Netlify site to the GitHub repo, deploy on push to `main`. (Joe has an existing Netlify account.)
- **Branch deploys**: enable for previewing PRs.
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

When the real site is ready to go live: don't delete `/coming-soon`. Just deploy the Astro build, which will replace `index.html` at the root. The `/coming-soon` folder can stay as a dated artifact.

---

## 11. First task — start here

Once you've read this file and the PRD:

1. Confirm Node.js LTS is installed (`node --version` should show v20+).
2. Initialize an Astro project in this directory: `npm create astro@latest -- --template minimal --typescript strict --no-install`
3. Install dependencies: `npm install` plus Tailwind, the Netlify adapter, and the sitemap plugin.
4. Set up `astro.config.mjs` with the Netlify adapter and the sitemap integration.
5. Create the folder structure per Section 8.
6. Build the homepage skeleton (no real copy yet — placeholder lorem) so we can confirm Tailwind + the layout system work.
7. Stop and ask Joe: (a) does the visual feel right? (b) ready for me to write the actual copy?

**Do not skip step 7.** Joe is the design reviewer. He needs to see the skeleton before you invest hours in content.

---

## 12. Working with Joe

- Joe is non-technical. Use plain English.
- When you finish a unit of work, summarize: what you did, what changed, what to look at, what to test, what's next.
- Don't ask Joe technical questions he can't answer. If you need a decision, give him 2–3 options with trade-offs in business terms.
- When you make a judgment call, say so explicitly: "I chose X because Y — let me know if you'd rather Z."
- Joe's working folder is `C:\Claude Code Projects\Sequel Web Studio`. Stay inside it.
- The Work Log (`Sequel Web Studio - Work Log.docx`) is the running history. Add an entry when you complete a phase or make a non-trivial decision.

---

## 13. Audit Deliverables Archive — do this at the end of every audit

After generating the PDF for any Pro Diagnosis + Remedy Package audit, **always** copy the deliverables to the archive folder on the C drive before closing the session.

**Archive root:** `C:\Sequel Audit Deliverables\`

**Folder naming convention:**
```
C:\Sequel Audit Deliverables\{YYYY-MM}\{client-slug}\
```
- `{YYYY-MM}` = year and month of audit delivery (e.g., `2026-05`)
- `{client-slug}` = lowercase hyphenated client name (e.g., `fort-worth-report`, `straight-edge-lawns`)

**Files to copy into the client folder:**
1. The **Remedy Package PDF** — e.g., `Fort-Worth-Report-Remedy-Package-May-2026.pdf`
2. Any **audit data JSON** — e.g., `fort-worth-report-audit-data-may-2026.json` (if produced via fill-template pipeline) or the network/data log JSON if the audit was done directly
3. Any **screenshots** taken during the Playwright session — rename them to `{client-slug}-screenshot-{description}.png`

**PowerShell commands to use (run in sequence after PDF is confirmed good):**
```powershell
New-Item -ItemType Directory -Force "C:\Sequel Audit Deliverables\{YYYY-MM}\{client-slug}"
Copy-Item "audit-tool\{PDF-filename}.pdf" "C:\Sequel Audit Deliverables\{YYYY-MM}\{client-slug}\" -Force
Copy-Item "audit-tool\{data}.json"        "C:\Sequel Audit Deliverables\{YYYY-MM}\{client-slug}\{client-slug}-audit-data-{mon-yyyy}.json" -Force
# Repeat Copy-Item for each screenshot PNG
```

**Why:** This archive is the single source of truth for all delivered audits. Joe uses it to reference past work, track client history, and retrieve files for follow-up. Never skip this step.

---

## 14. Audit HTML — PDF pagination rules

When writing the audit HTML report, all self-contained content blocks (remedy cards, priority action items, audit result rows, bonus diagnostic cards, standalone deliverable blocks) **must not be split across pages** unless the block is too tall to fit on a single page by itself.

Apply this CSS to every discrete block element:

```css
break-inside: avoid;
page-break-inside: avoid; /* legacy fallback */
```

**What counts as a block:** any `.remedy-card`, `.action-item`, `.check-row`, `.bonus-card`, `.deliverable-block`, or equivalent wrapper `<div>` that represents one complete idea or finding. If a block is short enough to fit on one page, it must start at the top of the next page rather than be cut in the middle.

**What this does NOT apply to:** section headers that intentionally bleed into content below, or blocks that are demonstrably longer than one full page (those will always span pages — that is acceptable).

This rule exists because split cards look unprofessional in the delivered PDF and undermine client confidence in the report.
