/**
 * Send the completed Pro Diagnosis + Remedy Package PDF to a client and/or Joe.
 *
 * Usage:
 *   node scripts/send-delivery.mjs --name "Business Name" --pdf "path/to/file.pdf" [--to "client@email.com"]
 *
 * --to provided  → emails client (professional delivery) + emails Joe (confirmation copy)
 * --to omitted   → emails Joe only (draft copy); on Windows also archives PDF to C:\Sequel Audit Deliverables\
 */

import { Resend } from 'resend';
import { readFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { resolve, basename, join } from 'path';

// Load .env if present (local dev); Codespaces injects secrets directly into process.env
try { process.loadEnvFile('.env'); } catch {}

// ── Arg parsing ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { args[argv[i].slice(2)] = argv[i + 1]; i++; }
  }
  return args;
}

const { to, name, pdf } = parseArgs(process.argv.slice(2));

if (!name || !pdf) {
  console.error('Usage: node scripts/send-delivery.mjs --name "<Business Name>" --pdf "<pdf-file>" [--to <client-email>]');
  process.exit(1);
}

// ── Resolve PDF ───────────────────────────────────────────────────────────────

const pdfPath     = existsSync(pdf) ? pdf : resolve(pdf);
if (!existsSync(pdfPath)) { console.error(`Error: PDF not found at "${pdfPath}"`); process.exit(1); }
const pdfFilename = basename(pdfPath);
const pdfBuffer   = readFileSync(pdfPath);

// ── Validate env ──────────────────────────────────────────────────────────────

const resendKey = process.env.RESEND_API_KEY;
if (!resendKey) { console.error('Error: RESEND_API_KEY not set'); process.exit(1); }

const FROM    = 'Joe Weeks <joe@sequelwebstudio.com>';
const JOE     = 'joe@sequelwebstudio.com';
const resend  = new Resend(resendKey);

// ── Email templates ───────────────────────────────────────────────────────────

function clientDeliveryHtml(businessName) {
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#1F3864,#2E75B6);padding:20px 24px;border-radius:10px 10px 0 0;">
      <span style="color:white;font-size:17px;font-weight:700;letter-spacing:-0.3px;">Sequel Web Studio</span>
      <div style="font-size:13px;margin-top:2px;">
        <a href="https://sequelwebstudio.com" style="color:rgba(255,255,255,0.65);text-decoration:none;">sequelwebstudio.com</a>
      </div>
    </div>
    <div style="border:1px solid #e4eaf5;border-top:none;padding:32px;border-radius:0 0 10px 10px;background:white;">
      <h2 style="margin:0 0 20px;color:#0F1F3D;font-size:22px;font-weight:700;">Your Pro Diagnosis + Remedy Package is ready.</h2>
      <p style="font-size:15px;color:#595959;line-height:1.7;margin:0 0 20px;">
        We've completed the full technical audit of <strong style="color:#0F1F3D;">${businessName}</strong> and built your personalized Remedy Package. It's attached to this email as a PDF.
      </p>
      <p style="font-size:15px;color:#595959;line-height:1.7;margin:0 0 12px;">Your report includes:</p>
      <ul style="margin:0 0 20px;padding-left:20px;color:#595959;font-size:15px;line-height:1.9;">
        <li>An executive summary of your site's current state</li>
        <li>A Priority Action List — the highest-impact issues found, ranked by business effect</li>
        <li>Step-by-step remedy instructions for every issue, written for your specific platform</li>
        <li>Ready-to-paste code blocks for any technical fixes</li>
      </ul>
      <p style="font-size:15px;color:#595959;line-height:1.7;margin:0 0 28px;">
        Questions about anything in the report? Reply to this email and I'll walk you through it.
      </p>
      <p style="font-size:14px;color:#595959;line-height:1.65;margin:0;">— Joe Weeks, Sequel Web Studio</p>
    </div>
    <p style="text-align:center;font-size:11px;color:#aaa;margin-top:20px;line-height:1.6;">
      Sequel Web Studio · sequelwebstudio.com<br>Northern Tarrant County, TX
    </p>
  </div>`;
}

function joeLogHtml(businessName, clientEmail, mode) {
  const isDraft  = mode === 'draft';
  const label    = isDraft ? 'Draft — not sent to client' : `Delivered to ${clientEmail}`;
  const badgeClr = isDraft ? '#8E44AD' : '#1a7a4a';
  const ts       = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#1F3864,#2E75B6);padding:16px 24px;border-radius:10px 10px 0 0;">
      <span style="color:white;font-size:15px;font-weight:700;">Sequel Web Studio — Delivery Log</span>
    </div>
    <div style="border:1px solid #e4eaf5;border-top:none;padding:28px;border-radius:0 0 10px 10px;background:white;">
      <div style="display:inline-block;background:${badgeClr};color:white;font-size:11px;font-weight:700;
                  padding:3px 10px;border-radius:4px;margin-bottom:20px;letter-spacing:0.5px;">
        ${label.toUpperCase()}
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#595959;">
        <tr><td style="padding:6px 0;font-weight:600;color:#1F3864;width:110px;">Business</td>
            <td style="padding:6px 0;">${businessName}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#1F3864;">Client email</td>
            <td style="padding:6px 0;">${clientEmail || '(not provided)'}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#1F3864;">PDF</td>
            <td style="padding:6px 0;">${pdfFilename}</td></tr>
        <tr><td style="padding:6px 0;font-weight:600;color:#1F3864;">Sent</td>
            <td style="padding:6px 0;">${ts} CT</td></tr>
      </table>
    </div>
  </div>`;
}

// ── Archive (Windows only, when no client email) ──────────────────────────────

function archiveLocally() {
  if (process.platform !== 'win32') return;
  const slugMatch  = pdfFilename.match(/^(.+?)-Remedy-Package/i);
  const clientSlug = (slugMatch ? slugMatch[1] : basename(pdfFilename, '.pdf')).toLowerCase();
  const now        = new Date();
  const yyyyMM     = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const archiveDir = `C:\\Sequel Audit Deliverables\\${yyyyMM}\\${clientSlug}`;
  mkdirSync(archiveDir, { recursive: true });
  const dest = join(archiveDir, pdfFilename);
  copyFileSync(pdfPath, dest);
  console.log(`Archived to: ${dest}`);
}

// ── Send ──────────────────────────────────────────────────────────────────────

const attachment = { filename: pdfFilename, content: pdfBuffer };

async function send(payload) {
  const { data, error } = await resend.emails.send(payload);
  if (error) { console.error('Resend error:', JSON.stringify(error, null, 2)); process.exit(1); }
  return data;
}

if (to) {
  console.log(`Sending delivery email to ${to} for "${name}"...`);
  await send({
    from:        FROM,
    to:          [to],
    subject:     `Your Pro Diagnosis + Remedy Package — ${name}`,
    html:        clientDeliveryHtml(name),
    attachments: [attachment],
  });
  console.log('Client email sent.');

  console.log(`Sending confirmation to ${JOE}...`);
  await send({
    from:        FROM,
    to:          [JOE],
    subject:     `[Delivered] Pro Diagnosis — ${name}`,
    html:        joeLogHtml(name, to, 'delivered'),
    attachments: [attachment],
  });
  console.log('Confirmation sent to Joe.');
} else {
  console.log(`No client email — sending draft copy to ${JOE}...`);
  await send({
    from:        FROM,
    to:          [JOE],
    subject:     `[Draft] Pro Diagnosis + Remedy Package — ${name}`,
    html:        joeLogHtml(name, null, 'draft'),
    attachments: [attachment],
  });
  console.log('Draft copy sent to Joe.');
  archiveLocally();
}
