# Pro Diagnosis + Remedy Package — Production Runbook

> **This is the single operational reference for every production run.** Start here, not in any other file.

---

## Joe's 3-Step Checklist

This is all Joe does for each client order. Everything else is automated.

```
1. Receive the briefing email  →  no action needed (automated)

2. Open Claude Code. Paste this trigger:

      Run Pro Diagnosis audit for [Client Name], [Business Name], [URL], [client email]

   Example:
      Run Pro Diagnosis audit for John Smith, BSR Bike Shop, https://bsrbikeshop.com, john@bsrbikeshop.com

3. Review the PDF when Claude presents it  →  type "approve" to send to the client
```

That's it. Claude handles everything between step 2 and step 3.

---

## One-Time Setup

These only need to be done once per machine. Skip if already done.

### Playwright MCP
Playwright MCP must be connected for Claude to run live browser audits.

1. Confirm `.mcp.json` exists in the project root (it should — it's in the repo)
2. In Claude Code, type `/mcp` and confirm **Playwright** shows as connected
3. If it shows "Failed" or "Needs Auth": close Claude Code, re-open the project, type `/mcp` again
4. Quick connectivity test: ask Claude *"Navigate to sequelwebstudio.com and tell me the page title"*

### Microsoft Edge
The PDF generation script (`generate-audit-pdf.mjs`) uses Edge as the headless browser.

- Confirm Edge is installed at one of these paths:
  - `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
  - `C:\Program Files\Microsoft\Edge\Application\msedge.exe`

### Environment Variables
The `.env` file in the project root must contain these values (populated by Joe):

```
GMAIL_USER=jaweeks7@gmail.com
GMAIL_APP_PASSWORD=[Gmail app-specific password]
```

The delivery script (`send-delivery.mjs`) reads these directly from `.env` — no Netlify needed.

---

## Full Pipeline — What Claude Does Automatically

When Joe pastes the trigger, Claude executes these steps in order:

| Step | What happens | Tool / Command |
|------|-------------|----------------|
| 1 | Derive file slugs from client name and current date | (internal) |
| 2 | Run all 28 standard checks on the client's live website | Playwright MCP + `templates/audit-session-guide.md` |
| 3 | Run applicable B-checks (platform-specific extras) | Playwright MCP |
| 4 | Assign badges (Critical / High Value / Pass / Nice to Have) | (internal) |
| 5 | Select top 10 priority items (all Criticals first, then High Values) | (internal) |
| 6 | Write executive summary and deliverables list | (internal) |
| 7 | Generate the JSON data file | writes `[client]-audit-data-[month]-[year].json` |
| 8 | Build the HTML report | `node scripts/fill-template.mjs [data-file]` |
| 9 | Generate the PDF | `node scripts/generate-audit-pdf.mjs [html-file]` |
| 10 | Present PDF filename + key findings summary to Joe for review | (waits for approval) |
| 11 | On approval: email PDF to client | `node --env-file=.env scripts/send-delivery.mjs ...` |

---

## File Naming Conventions

Claude derives these filenames automatically from the business name and date:

| File | Pattern | Example |
|------|---------|---------|
| JSON data | `[client-slug]-audit-data-[month]-[year].json` | `bsr-bikeshop-audit-data-may-2026.json` |
| HTML report | `[client-slug]-pro-diagnosis-[month]-[year].html` | `bsr-bikeshop-pro-diagnosis-may-2026.html` |
| PDF deliverable | `[Client-Slug]-Remedy-Package-[Month]-[Year].pdf` | `Bsr-Bikeshop-Remedy-Package-May-2026.pdf` |

---

## Tool Inventory

Every tool used in the pipeline, with exact command syntax:

### Playwright MCP (audit execution)
Claude runs this automatically. No command needed — it uses the MCP connection established by `.mcp.json`.

The check-by-check execution instructions are in `templates/audit-session-guide.md`.

### fill-template.mjs (HTML generation)
```bash
node scripts/fill-template.mjs [client]-audit-data-[month]-[year].json
```
- Reads JSON from the file path given
- Reads HTML skeleton from `templates/audit-report-template.html`
- Writes output HTML to project root
- Console output tells you the exact output filename and the next command to run

### generate-audit-pdf.mjs (PDF generation)
```bash
node scripts/generate-audit-pdf.mjs [client]-pro-diagnosis-[month]-[year].html
```
- Requires Microsoft Edge installed (see One-Time Setup)
- Launches headless Edge, renders the HTML at 816×1056px (US Letter), exports PDF
- Writes PDF to project root
- Takes ~10–15 seconds to run

### send-delivery.mjs (client delivery)
```bash
node --env-file=.env scripts/send-delivery.mjs \
  --to "client@example.com" \
  --name "Business Name" \
  --pdf "Client-Slug-Remedy-Package-Month-Year.pdf"
```
- Requires `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `.env`
- Attaches the PDF and sends from `jaweeks7@gmail.com` (Gmail SMTP — see note below about business email)
- Subject: `Your Pro Diagnosis + Remedy Package — [Business Name]`
- Logs success to console with timestamp

---

## QA Before Approval

Before typing "approve", quickly verify:

- [ ] PDF opens cleanly in Edge (no blank sections, no broken layout)
- [ ] Client name and URL are correct on the cover page
- [ ] Priority Action List has the right issues in the right order
- [ ] At least one standalone code deliverable is included if applicable
- [ ] Executive summary reads naturally (no placeholder text)

Full QA checklist: `templates/audit-qa-checklist.html` (open in browser)

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| Playwright shows "Failed" in `/mcp` | Extension disconnected | Close and reopen Claude Code; reload the VS Code window (`Ctrl+Shift+P` → Reload Window) |
| `generate-audit-pdf.mjs` throws "Edge not found" | Edge path wrong | Confirm Edge is installed; check both paths in the script |
| `send-delivery.mjs` throws auth error | Gmail App Password wrong or expired | Go to myaccount.google.com → Security → App passwords; generate a new one and update `.env` |
| PDF has broken layout / missing backgrounds | Edge version or print CSS issue | Open the HTML in Edge manually → print to PDF → check if same issue appears in browser print preview |
| JSON generation has wrong badge counts | Intake data inconsistency | Re-read the JSON against the intake sheet; check that `priorityItems` count matches `remedyItems` count |

---

## Related Files

| File | What it is |
|------|-----------|
| `Audit-Product-Process.md` | Product spec: decisions, scope, pricing, deliverable structure |
| `templates/audit-session-guide.md` | Claude's execution guide for the live audit (Playwright actions per check) |
| `templates/audit-intake-sheet-template.md` | Human-readable intake form (for reference; Claude uses session guide directly) |
| `templates/audit-data-schema.json` | JSON format specification for the data file |
| `templates/audit-report-template.html` | HTML skeleton with CSS + `{{PLACEHOLDER}}` tokens |
| `templates/audit-qa-checklist.html` | Pre-delivery QA form (open in browser) |

---

*Sequel Web Studio · Updated May 2026*
