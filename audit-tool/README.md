# Sequel Web Studio — Website Audit Tool

A self-contained Node.js script that audits any website against the Sequel Web Studio
16-point audit (10 Visible Opportunities + 6 AI-Era Foundation checks, plus a rolled-up
AI-retrievability summary).

No external dependencies. No API key required (optional). Runs locally on your laptop so
the Cowork allowlist doesn't apply.

---

## One-time setup

**Step 1 — Confirm Node.js is installed.** Open a terminal (Windows PowerShell or
Command Prompt) and run:

```
node --version
```

You should see something like `v20.11.1` or higher. If you see "command not found" or a
version below 18, download the LTS installer from https://nodejs.org/ and install it.

**Step 2 — Open a terminal in the audit-tool folder.** Easiest way on Windows:

1. Open File Explorer.
2. Navigate to `C:\Claude Code Projects\My Website Company\audit-tool\`.
3. Click the address bar, type `cmd`, press Enter. A Command Prompt opens already pointed
   at the folder.

**Step 3 — Run a test.** From that terminal:

```
node audit.js https://sequelwebstudio.com
```

It will fetch the site and print a report. (If sequelwebstudio.com isn't live yet, try
any site — `node audit.js https://www.google.com` works.)

You're set up.

---

## Running an audit

```
node audit.js <url> [business-name-in-quotes]
```

Examples:

```
node audit.js https://greekcafekeller.com "Greek Cafe Keller"
node audit.js thestraightedgelawns.com "The Straight Edge Lawns"
node audit.js bestpoolguys.com
```

Each run takes **30–75 seconds** — most of that is the PageSpeed Insights check.

Two files are written to `audit-tool/audits/`:

- `<slug>-<date>.md` — human-readable report (open in any text editor or Word)
- `<slug>-<date>.json` — raw findings (for future automation, e.g. n8n)

---

## What gets checked

### Section A — Visible Opportunities (what you'd notice on a walk-through)

| Code | Check |
| ---- | ----- |
| A1   | Mobile viewport meta tag |
| A3   | Footer copyright year (stale = site looks abandoned) |
| A4   | Image alt text coverage |
| A5   | Contact method on home page (form, mailto:, tel:) |
| A6   | HTTPS |
| A7   | Favicon |
| A8   | Page title & meta description length |
| A10  | Google Business Profile / Maps link |
| A11  | Analytics / tracking installed |
| A12  | Social media links |

### Section B — AI-Era Foundation (what the owner can't eyeball)

| Code | Check |
| ---- | ----- |
| B1   | schema.org JSON-LD structured data |
| B2   | llms.txt at `/llms.txt` |
| B3   | robots.txt AI crawler directives (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, etc.) |
| B4   | Open Graph & Twitter Card tags |
| B5   | Core Web Vitals (mobile) via PageSpeed Insights |
| B6   | XML sitemap at `/sitemap.xml` |
| B7   | Semantic HTML structure (`<main>`, `<header>`, etc.) |
| B8   | AI assistant retrievability summary (rolls up B1/B2/B3/B4/B6) |

Findings are one of **PASS**, **FAIL**, or **INFO**. The Markdown report leads with a
"Priority Fixes" list — all FAILs, AI-era section first.

---

## Optional — add a PageSpeed API key (recommended once you're auditing regularly)

Without a key, PageSpeed Insights allows a handful of requests per minute. For daily use,
get a free key:

1. Go to https://developers.google.com/speed/docs/insights/v5/get-started.
2. Click "Get a Key" — sign in with your Google account and create a project.
3. Copy the key.
4. In your terminal, before running the audit, set it as an environment variable:

   **Windows Command Prompt:**
   ```
   set PSI_API_KEY=your_key_here
   node audit.js https://example.com
   ```

   **Windows PowerShell:**
   ```
   $env:PSI_API_KEY="your_key_here"
   node audit.js https://example.com
   ```

To make it permanent, add `PSI_API_KEY` as a user environment variable in Windows
Settings (search "Edit environment variables for your account").

---

## Troubleshooting

**"FAILED to fetch <url>: ENOTFOUND"** — Typo in the URL, or the site is down.

**"FAILED to fetch <url>: timeout"** — Site is very slow or blocking the script's User-
Agent. Try the URL in a browser first to confirm it loads.

**"PageSpeed Insights fetch failed: status 429"** — You've hit the no-key rate limit. Wait
a minute and rerun, or set up an API key (see above).

**Report shows [INFO] for most items** — Some sites are heavy on JavaScript and render
most content client-side. The script only reads the raw HTML. If the report looks
suspiciously empty, open the page and right-click → "View Page Source" — if it's mostly
empty, that's why. (We can add headless-browser rendering in a later version if needed.)

---

## Roadmap (what we'd add next)

- **Headless-browser rendering** for JS-heavy sites (Puppeteer) — only if we hit real
  cases that need it.
- **PDF export** of the Markdown report (so you can hand it to a prospect).
- **Batch mode** — feed a CSV of prospects, get one report per row (pairs with the Pilot
  Prospect List workflow).
- **n8n automation** — wrap this script in an n8n node so audits can be triggered by a
  form submission or scheduled crawl.
