import Stripe from 'stripe';
import { getStore } from '@netlify/blobs';
import nodemailer from 'nodemailer';

type LambdaEvent = {
  httpMethod: string;
  headers: Record<string, string>;
  body: string | null;
  isBase64Encoded?: boolean;
};

type LambdaResponse = {
  statusCode: number;
  body: string;
};

// ── Email templates ──────────────────────────────────────────────────────────

function receiptHtml(params: {
  clientName: string;
  businessName: string;
  siteUrl: string;
  paidAt: string;
  contactEmail: string;
}): string {
  const { clientName, businessName, siteUrl, paidAt, contactEmail } = params;
  const date = new Date(paidAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago',
  });
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#1F3864,#2E75B6);padding:20px 24px;border-radius:10px 10px 0 0;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <span style="color:white;font-size:17px;font-weight:700;letter-spacing:-0.3px;">Sequel Web Studio</span>
          <div style="color:rgba(255,255,255,0.55);font-size:13px;margin-top:2px;">sequelwebstudio.com</div>
        </div>
        <span style="background:rgba(22,163,74,0.85);color:white;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:9999px;">Payment received</span>
      </div>
      <div style="border:1px solid #e4eaf5;border-top:none;padding:32px;border-radius:0 0 10px 10px;background:white;">
        <h2 style="margin:0 0 6px;color:#0F1F3D;font-size:22px;font-weight:700;">Order confirmed — you're in.</h2>
        <p style="margin:0 0 28px;color:#595959;font-size:14px;">${date}</p>

        <p style="font-size:15px;color:#0F1F3D;line-height:1.65;margin:0 0 20px;">
          Hi ${clientName},
        </p>
        <p style="font-size:15px;color:#595959;line-height:1.65;margin:0 0 28px;">
          We've received your payment and your Pro Diagnosis + Remedy Package is underway. We'll run a full live audit of <strong style="color:#0F1F3D;">${siteUrl}</strong> and deliver your report to this email address within 24 hours.
        </p>

        <div style="background:#F4F6FB;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#2E75B6;margin-bottom:14px;">What's next</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${['We run a live 28+ point technical audit of your website in a real browser session.',
               'We build your Remedy Package — platform-specific, ready-to-paste fixes for every issue we find.',
               'You receive your Pro Diagnosis + Remedy Package as a PDF, delivered to this email within 24 hours.']
              .map((step, i) => `
                <div style="display:flex;gap:12px;align-items:flex-start;">
                  <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#2E75B6,#8E44AD);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:white;font-size:11px;font-weight:700;">${i + 1}</div>
                  <p style="margin:0;font-size:14px;color:#595959;line-height:1.6;">${step}</p>
                </div>`).join('')}
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
          <tr style="background:#F4F6FB;">
            <td colspan="2" style="padding:8px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#0F1F3D;">Payment Receipt</td>
          </tr>
          ${[
            ['Product',      'Pro Diagnosis + Remedy Package'],
            ['Website',      siteUrl],
            ['Business',     businessName],
            ['Amount Paid',  '$350.00 USD'],
            ['Delivery',     'Within 24 hours to this email address'],
          ].map(([label, val], i) => `
            <tr>
              <td style="padding:10px 14px;border-bottom:1px solid #e4eaf5;font-size:13px;font-weight:600;color:#0F1F3D;white-space:nowrap;width:120px;">${label}</td>
              <td style="padding:10px 14px;border-bottom:1px solid #e4eaf5;font-size:13px;${i === 3 ? 'color:#16a34a;font-weight:600;' : 'color:#595959;'}">${i === 3 ? '&#10003; ' + val : val}</td>
            </tr>`).join('')}
        </table>

        <p style="font-size:14px;color:#595959;line-height:1.65;margin:0 0 6px;">
          Questions? Reply to this email or reach us at <a href="mailto:${contactEmail}" style="color:#2E75B6;">${contactEmail}</a>
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

function briefingHtml(params: {
  clientName: string;
  businessName: string;
  siteUrl: string;
  email: string;
  notes: string;
  paymentId: string;
  paidAt: string;
}): string {
  const { clientName, businessName, siteUrl, email, notes, paymentId, paidAt } = params;
  const date = new Date(paidAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago',
  });
  const clientSlug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const monthYear  = new Date(paidAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'America/Chicago' }).toLowerCase().replace(' ', '-');

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#1F3864,#2E75B6);padding:20px 24px;border-radius:10px 10px 0 0;display:flex;align-items:center;justify-content:space-between;">
        <span style="color:white;font-size:17px;font-weight:700;letter-spacing:-0.3px;">Sequel Web Studio</span>
        <span style="background:rgba(22,163,74,0.85);color:white;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:9999px;">$350 received</span>
      </div>
      <div style="border:1px solid #e4eaf5;border-top:none;padding:28px;border-radius:0 0 10px 10px;background:white;">
        <h2 style="margin:0 0 4px;color:#0F1F3D;font-size:22px;font-weight:700;">New order — ${businessName}</h2>
        <p style="margin:0 0 24px;color:#595959;font-size:14px;">${date} CT</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          ${[
            ['Client',    clientName],
            ['Business',  businessName],
            ['Website',   `<a href="${siteUrl}" style="color:#2E75B6;">${siteUrl}</a>`],
            ['Email',     `<a href="mailto:${email}" style="color:#2E75B6;">${email}</a>`],
            notes ? ['Notes', notes] : null,
            ['Stripe ID', `<span style="font-family:monospace;font-size:12px;color:#595959;">${paymentId}</span>`],
          ].filter(Boolean).map(([label, val]) => `
            <tr>
              <td style="padding:10px 14px;border-bottom:1px solid #e4eaf5;font-size:13px;font-weight:600;color:#0F1F3D;white-space:nowrap;width:110px;">${label}</td>
              <td style="padding:10px 14px;border-bottom:1px solid #e4eaf5;font-size:13px;color:#595959;">${val}</td>
            </tr>`).join('')}
        </table>

        <div style="background:#F4F6FB;border-left:3px solid #2E75B6;padding:16px 20px;border-radius:0 8px 8px 0;">
          <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#0F1F3D;margin:0 0 10px;">Next steps</p>
          <ol style="margin:0;padding-left:18px;font-size:13px;color:#595959;line-height:1.9;">
            <li>Copy <code>templates/audit-intake-sheet-template.md</code> → <code>${clientSlug}-audit-intake-${monthYear}.md</code></li>
            <li>Open the session guide: <code>templates/audit-session-guide.md</code></li>
            <li>Run the live audit on <a href="${siteUrl}" style="color:#2E75B6;">${siteUrl}</a></li>
            <li>Hand intake sheet to Claude → generate JSON → run pipeline → deliver PDF to <a href="mailto:${email}" style="color:#2E75B6;">${email}</a></li>
          </ol>
        </div>
      </div>
    </div>`;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  const sig = event.headers['stripe-signature'];

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 400, body: 'Missing configuration.' };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let webhookEvent: Stripe.Event;
  try {
    const payload = event.isBase64Encoded
      ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
      : (event.body ?? '');
    webhookEvent = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err);
    return { statusCode: 400, body: 'Webhook signature verification failed.' };
  }

  if (webhookEvent.type === 'checkout.session.completed') {
    const session = webhookEvent.data.object as Stripe.Checkout.Session;
    const meta    = session.metadata ?? {};

    const { clientName = '', businessName = '', siteUrl = '', email = '', notes = '' } = meta;
    const paidAt    = new Date(session.created * 1000).toISOString();
    const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : '';

    // Persist order record
    try {
      const store = getStore('pro-diagnosis-orders');
      await store.set(`order-${Date.now()}`, JSON.stringify({
        stripeSessionId: session.id,
        paymentId,
        clientName,
        businessName,
        siteUrl,
        email,
        notes,
        paidAt,
      }));
    } catch (err) {
      console.error('[stripe-webhook] Failed to store order:', err);
      // Non-fatal — emails still send
    }

    // Send emails
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const contactEmail = process.env.GMAIL_USER;

      await Promise.all([
        // Receipt to customer
        transporter.sendMail({
          from:    `"Sequel Web Studio" <${contactEmail}>`,
          to:      email,
          subject: 'Payment Receipt — Pro Diagnosis + Remedy Package',
          html:    receiptHtml({ clientName, businessName, siteUrl, paidAt, contactEmail }),
        }),
        // Briefing to Joe
        transporter.sendMail({
          from:    `"Sequel Web Studio" <${contactEmail}>`,
          to:      contactEmail,
          subject: `New Pro Diagnosis Order — ${businessName}`,
          html:    briefingHtml({ clientName, businessName, siteUrl, email, notes, paymentId, paidAt }),
        }),
      ]);

      console.log(`[stripe-webhook] Order processed for ${businessName} (${email}).`);
    } else {
      console.warn('[stripe-webhook] GMAIL_USER or GMAIL_APP_PASSWORD not set — emails skipped.');
    }
  }

  return { statusCode: 200, body: 'OK' };
};
