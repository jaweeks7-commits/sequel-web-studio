import Stripe from 'stripe';

type LambdaEvent = {
  httpMethod: string;
  headers?: Record<string, string>;
  body: string | null;
  isBase64Encoded?: boolean;
};

type LambdaResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Verifies a Cloudflare Turnstile token server-side. Dormant until
// TURNSTILE_SECRET_KEY is set (and the front-end renders the widget): with no
// secret configured it returns true so it can't break the live form. Once the
// secret is set, a missing or invalid token is rejected.
async function turnstilePassed(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed.' }) };
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    console.error('[create-checkout-session] STRIPE_SECRET_KEY or STRIPE_PRICE_ID not set.');
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Payment is not configured yet. Please contact us directly.' }) };
  }

  let name: string, business: string, url: string, email: string, notes: string;
  let botField: string, turnstileToken: string;
  try {
    const body = JSON.parse(event.body ?? '{}');
    name           = (body.name           ?? '').trim();
    business       = (body.business       ?? '').trim();
    url            = (body.url            ?? '').trim();
    email          = (body.email          ?? '').trim();
    notes          = (body.notes           ?? '').trim();
    botField       = (body.botField        ?? '').trim();
    turnstileToken = (body.turnstileToken  ?? '').trim();
  } catch {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid request.' }) };
  }

  // Honeypot — a real user never fills this hidden field. Return a benign 200 so
  // a bot can't tell it was rejected.
  if (botField) {
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ checkoutUrl: null }) };
  }

  const clientIp = event.headers?.['x-nf-client-connection-ip'] || event.headers?.['x-forwarded-for'];
  if (!(await turnstilePassed(turnstileToken, clientIp))) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Bot verification failed. Please refresh and try again.' }) };
  }

  if (!name || !business || !url || !email) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Please fill in all required fields.' }) };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const siteUrl = process.env.PUBLIC_SITE_URL ?? 'https://sequelwebstudio.com';

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: email,
      metadata: {
        // Identifies this as a Pro Diagnosis purchase so the webhook can
        // distinguish it from other Stripe checkouts (e.g. hosting subscriptions).
        product:      'pro-diagnosis',
        clientName:   name,
        businessName: business,
        siteUrl:      url,
        email,
        notes:        notes.slice(0, 500),
      },
      success_url: `${siteUrl}/audit?order=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/audit?order=cancelled`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Stripe error';
    // Log the detail server-side; don't leak internal Stripe error text to the browser.
    console.error('[create-checkout-session] Stripe error:', message);
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: "We couldn't start checkout just now. Please try again, or email us and we'll help." }) };
  }

  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({ checkoutUrl: session.url }),
  };
};
