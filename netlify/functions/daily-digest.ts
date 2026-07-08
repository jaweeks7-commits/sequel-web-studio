import { getStore } from '@netlify/blobs';
import nodemailer from 'nodemailer';
// Visitor-submitted URLs are rendered into the digest email body, so escape
// them to prevent HTML/attribute injection into the message.
import { escapeHtml } from '../lib/escape';
import { isSheetsConfigured, appendAuditRows } from '../lib/sheets';

type LambdaResponse = {
  statusCode: number;
  body: string;
};

type Scores = {
  performance: number;
  seo: number;
  ai: number;
  mobile: number;
  security: number;
};

type Submission = {
  url: string;
  submittedAt: string;
  scores?: Scores;
  criticalCount?: number;
};

// Same tiers the site uses for the scan result card: <50 red, 50-79 amber, 80+ green.
function scoreColor(n: number): string {
  if (n < 50) return '#DC2626';
  if (n < 80) return '#D97706';
  return '#16A34A';
}

function scoreCell(v?: number): string {
  const base = 'padding:8px 6px;border-bottom:1px solid #e4eaf5;font-size:13px;text-align:center;';
  if (typeof v !== 'number' || Number.isNaN(v)) {
    return `<td style="${base}color:#bbb;">n/a</td>`;
  }
  return `<td style="${base}color:${scoreColor(v)};font-weight:700;">${v}</td>`;
}

function domainOf(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
}

// Scheduled V2 Netlify function. V2 functions receive the Netlify Blobs context
// automatically (no connectLambda dance, unlike the V1 request functions in
// netlify/lib/blobs.ts) and are not exposed on a public URL, so no manual guard
// is needed. The schedule lives here in `config` rather than in netlify.toml.
export default async (): Promise<Response> => {
  const result = await runDigest();
  return new Response(result.body, { status: result.statusCode });
};

export const config = {
  // 8 AM Central (14:00 UTC covers CST; shifts to 9 AM during CDT).
  schedule: '0 14 * * *',
};

// Core digest logic, separated so the on-demand debug endpoint can flush the
// queue too. Assumes the Blobs context is available (V2 ambient here, or
// connected by the V1 debug caller before it invokes runDigest).
export async function runDigest(): Promise<LambdaResponse> {
  const store = getStore('audit-leads');
  const { blobs } = await store.list();

  if (blobs.length === 0) {
    console.log('[daily-digest] No submissions — skipping email.');
    return { statusCode: 200, body: 'No submissions.' };
  }

  // Read all entries
  const submissions: Submission[] = [];
  for (const blob of blobs) {
    try {
      const raw = (await store.get(blob.key)) as unknown as string | null;
      if (raw) submissions.push(JSON.parse(raw) as Submission);
    } catch {
      // skip malformed entries
    }
  }

  submissions.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

  const count = submissions.length;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago',
  });

  const rows = submissions
    .map(s => {
      const time = new Date(s.submittedAt).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago',
      });
      const sc = s.scores;
      const crit = s.criticalCount;
      const critCell =
        typeof crit === 'number'
          ? `<td style="padding:8px 6px;border-bottom:1px solid #e4eaf5;font-size:13px;text-align:center;font-weight:700;color:${crit > 0 ? '#DC2626' : '#16A34A'};">${crit}</td>`
          : `<td style="padding:8px 6px;border-bottom:1px solid #e4eaf5;font-size:13px;text-align:center;color:#bbb;">n/a</td>`;
      return `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #e4eaf5;font-size:13px;">${escapeHtml(domainOf(s.url))}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e4eaf5;font-size:12px;color:#595959;white-space:nowrap;">${time} CT</td>
          ${scoreCell(sc?.performance)}
          ${scoreCell(sc?.seo)}
          ${scoreCell(sc?.ai)}
          ${scoreCell(sc?.mobile)}
          ${scoreCell(sc?.security)}
          ${critCell}
        </tr>`;
    })
    .join('');

  const th = 'padding:8px 6px;text-align:center;color:#0F1F3D;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;';
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#1F3864,#2E75B6);padding:20px 24px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:10px;">
        <span style="color:white;font-size:17px;font-weight:700;letter-spacing:-0.3px;">Sequel Web Studio</span>
      </div>
      <div style="border:1px solid #e4eaf5;border-top:none;padding:28px;border-radius:0 0 10px 10px;background:white;">
        <h2 style="margin:0 0 4px;color:#0F1F3D;font-size:22px;font-weight:700;">
          ${count} audit request${count !== 1 ? 's' : ''} today
        </h2>
        <p style="margin:0 0 24px;color:#595959;font-size:14px;">${today}</p>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#F4F6FB;">
              <th style="${th}text-align:left;padding-left:10px;">Domain</th>
              <th style="${th}text-align:left;padding-left:10px;">Time</th>
              <th style="${th}">Perf</th>
              <th style="${th}">SEO</th>
              <th style="${th}">AI</th>
              <th style="${th}">Mobile</th>
              <th style="${th}">Sec</th>
              <th style="${th}">Crit</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#aaa;line-height:1.6;">
          Scores: 0-49 red, 50-79 amber, 80-100 green · "Crit" = critical issues found.<br>
          Sent automatically by your website · Only delivered on days with activity
        </p>
      </div>
    </div>`;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('[daily-digest] GMAIL_USER or GMAIL_APP_PASSWORD not set — cannot send email.');
    return { statusCode: 500, body: 'Email env vars not configured.' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Sequel Web Studio" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `${count} audit request${count !== 1 ? 's' : ''} — ${today}`,
    html,
  });

  // Permanent archive: append the day's requests to the Google Sheet (no-op
  // when unconfigured). Only clear the blobs once they're safely archived, so a
  // Sheets outage never loses rows — it just repeats in tomorrow's email.
  let safeToClear = true;
  if (isSheetsConfigured()) {
    const sheetRows: (string | number)[][] = submissions.map(s => {
      const ts = new Date(s.submittedAt).toLocaleString('en-US', { timeZone: 'America/Chicago' });
      const sc = s.scores;
      return [
        ts,
        domainOf(s.url),
        s.url,
        sc?.performance ?? '',
        sc?.seo ?? '',
        sc?.ai ?? '',
        sc?.mobile ?? '',
        sc?.security ?? '',
        s.criticalCount ?? '',
      ];
    });
    try {
      await appendAuditRows(sheetRows);
      console.log(`[daily-digest] Appended ${sheetRows.length} row(s) to the Sheet.`);
    } catch (err) {
      safeToClear = false;
      console.error('[daily-digest] Sheet append failed — keeping blobs for retry:', err);
    }
  }

  if (safeToClear) {
    await Promise.all(blobs.map(b => store.delete(b.key)));
    console.log(`[daily-digest] Digest sent: ${count} submission(s). Store cleared.`);
    return { statusCode: 200, body: `Digest sent: ${count} submission(s).` };
  }

  console.log(`[daily-digest] Digest sent: ${count} submission(s). Store retained (Sheet append failed).`);
  return { statusCode: 200, body: `Digest sent: ${count} submission(s); Sheet append failed, store retained.` };
};
