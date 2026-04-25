import { getStore } from '@netlify/blobs';
import nodemailer from 'nodemailer';

type LambdaResponse = {
  statusCode: number;
  body: string;
};

type Submission = {
  url: string;
  submittedAt: string;
};

export const handler = async (): Promise<LambdaResponse> => {
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
      const raw = await store.get(blob.key);
      if (raw) submissions.push(JSON.parse(raw) as Submission);
    } catch {
      // skip malformed entries
    }
  }

  const count = submissions.length;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago',
  });

  const rows = submissions
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
    .map(s => {
      const time = new Date(s.submittedAt).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago',
      });
      return `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e4eaf5;font-size:14px;">${s.url}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e4eaf5;font-size:14px;color:#595959;white-space:nowrap;">${time} CT</td>
        </tr>`;
    })
    .join('');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;">
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
              <th style="padding:8px 14px;text-align:left;color:#0F1F3D;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Domain</th>
              <th style="padding:8px 14px;text-align:left;color:#0F1F3D;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Time</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#aaa;line-height:1.6;">
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

  // Clear processed entries so they don't appear in tomorrow's digest
  await Promise.all(blobs.map(b => store.delete(b.key)));

  console.log(`[daily-digest] Digest sent: ${count} submission(s). Store cleared.`);
  return { statusCode: 200, body: `Digest sent: ${count} submission(s).` };
};
