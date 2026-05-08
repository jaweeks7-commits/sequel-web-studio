/**
 * Send the completed Pro Diagnosis + Remedy Package PDF to a client.
 * Reads GMAIL_USER and GMAIL_APP_PASSWORD from .env (loaded via --env-file flag).
 *
 * Usage:
 *   node --env-file=.env scripts/send-delivery.mjs \
 *     --to "client@example.com" \
 *     --name "Business Name" \
 *     --pdf "Client-Slug-Remedy-Package-Month-Year.pdf"
 */

import nodemailer from 'nodemailer';
import { readFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');

// ── Arg parsing ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const { to, name, pdf } = args;

if (!to || !name || !pdf) {
  console.error('Usage: node --env-file=.env scripts/send-delivery.mjs --to <email> --name "<Business Name>" --pdf "<PDF filename>"');
  process.exit(1);
}

// ── Resolve PDF path ──────────────────────────────────────────────────────────

const pdfPath = existsSync(pdf) ? pdf : resolve(ROOT, pdf);

if (!existsSync(pdfPath)) {
  console.error(`Error: PDF not found at "${pdfPath}"`);
  process.exit(1);
}

const pdfFilename = basename(pdfPath);

// ── Validate env vars ─────────────────────────────────────────────────────────

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

if (!gmailUser || !gmailPass) {
  console.error('Error: GMAIL_USER and GMAIL_APP_PASSWORD must be set in .env');
  process.exit(1);
}

// ── Email content ─────────────────────────────────────────────────────────────

function deliveryHtml(businessName) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#1F3864,#2E75B6);padding:20px 24px;border-radius:10px 10px 0 0;">
        <span style="color:white;font-size:17px;font-weight:700;letter-spacing:-0.3px;">Sequel Web Studio</span>
        <div style="font-size:13px;margin-top:2px;"><a href="https://sequelwebstudio.com" style="color:rgba(255,255,255,0.65);text-decoration:none;">sequelwebstudio.com</a></div>
      </div>
      <div style="border:1px solid #e4eaf5;border-top:none;padding:32px;border-radius:0 0 10px 10px;background:white;">
        <h2 style="margin:0 0 20px;color:#0F1F3D;font-size:22px;font-weight:700;">Your Pro Diagnosis + Remedy Package is ready.</h2>
        <p style="font-size:15px;color:#595959;line-height:1.7;margin:0 0 20px;">
          We've completed the full technical audit of <strong style="color:#0F1F3D;">${businessName}</strong> and built your personalized Remedy Package. It's attached to this email as a PDF.
        </p>
        <p style="font-size:15px;color:#595959;line-height:1.7;margin:0 0 20px;">
          Your report includes:
        </p>
        <ul style="margin:0 0 20px;padding-left:20px;color:#595959;font-size:15px;line-height:1.9;">
          <li>An executive summary of your site's current state</li>
          <li>A Priority Action List — the 10 issues with the highest impact on your traffic and conversions</li>
          <li>Step-by-step remedy instructions for every issue, written for your specific platform</li>
          <li>Ready-to-paste code blocks for any technical fixes</li>
        </ul>
        <p style="font-size:15px;color:#595959;line-height:1.7;margin:0 0 28px;">
          Questions about anything in the report? Reply to this email and I'll walk you through it.
        </p>
        <p style="font-size:14px;color:#595959;line-height:1.65;margin:0;">
          — Joe Weeks, Sequel Web Studio
        </p>
      </div>
      <p style="text-align:center;font-size:11px;color:#aaa;margin-top:20px;line-height:1.6;">
        Sequel Web Studio · sequelwebstudio.com<br>Northern Tarrant County, TX
      </p>
    </div>`;
}

// ── Send ──────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: gmailUser, pass: gmailPass },
});

console.log(`Sending delivery email to ${to} for "${name}"...`);
console.log(`Attaching: ${pdfFilename}`);

await transporter.sendMail({
  from:        `"Sequel Web Studio" <${gmailUser}>`,
  to,
  subject:     `Your Pro Diagnosis + Remedy Package — ${name}`,
  html:        deliveryHtml(name),
  attachments: [{ filename: pdfFilename, path: pdfPath }],
});

const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
console.log(`Done: delivery email sent at ${timestamp} CT`);
