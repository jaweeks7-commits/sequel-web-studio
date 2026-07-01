import { getStore } from '@netlify/blobs';

type LambdaEvent = {
  httpMethod: string;
  headers?: Record<string, string>;
  body: string | null;
};

type LambdaResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const JSON_CT = { 'Content-Type': 'application/json' };
const json = (data: unknown) => JSON.stringify(data);

// Verifies a Cloudflare Turnstile token server-side. Dormant until
// TURNSTILE_SECRET_KEY is set (and the front-end sends a token): with no secret
// configured it returns true so it can't break the form. Once set, a missing or
// invalid token is rejected.
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
    return { statusCode: 405, headers: JSON_CT, body: json({ error: 'Method not allowed' }) };
  }

  let url: string, botField: string, turnstileToken: string;
  try {
    const body = JSON.parse(event.body ?? '{}') as { url?: string; botField?: string; turnstileToken?: string };
    url            = (body.url            ?? '').trim();
    botField       = (body.botField        ?? '').trim();
    turnstileToken = (body.turnstileToken  ?? '').trim();
  } catch {
    return { statusCode: 400, headers: JSON_CT, body: json({ error: 'Invalid request body' }) };
  }

  // Honeypot — a real user never fills this. Return a benign queued response so
  // a bot can't distinguish rejection from success.
  if (botField) {
    return { statusCode: 200, headers: JSON_CT, body: json({ status: 'queued' }) };
  }

  const clientIp = event.headers?.['x-nf-client-connection-ip'] || event.headers?.['x-forwarded-for'];
  if (!(await turnstilePassed(turnstileToken, clientIp))) {
    return { statusCode: 400, headers: JSON_CT, body: json({ error: 'Bot verification failed. Please refresh and try again.' }) };
  }

  if (!url) {
    return { statusCode: 400, headers: JSON_CT, body: json({ error: 'URL is required' }) };
  }

  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    new URL(normalized);
  } catch {
    return { statusCode: 400, headers: JSON_CT, body: json({ error: 'Please enter a valid URL' }) };
  }

  // Store submission in Netlify Blobs — picked up by the daily digest function
  try {
    const store = getStore('audit-leads');
    await store.set(
      `submission-${Date.now()}`,
      JSON.stringify({ url: normalized, submittedAt: new Date().toISOString() }),
    );
  } catch (err) {
    // Don't fail the visitor's request if storage is unavailable (e.g. local dev)
    console.error('[audit] Blob storage failed:', err);
  }

  console.log(`[audit] Submission received: ${normalized}`);

  return {
    statusCode: 200,
    headers: JSON_CT,
    body: json({
      status: 'queued',
      message: "Audit submitted — we'll have your report ready shortly.",
    }),
  };
};
