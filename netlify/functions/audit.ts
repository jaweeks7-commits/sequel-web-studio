import { getStore } from '@netlify/blobs';
import { JSON_HEADERS, json } from '../lib/http';
import { turnstilePassed } from '../lib/turnstile';

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

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: JSON_HEADERS, body: json({ error: 'Method not allowed' }) };
  }

  let url: string, botField: string, turnstileToken: string;
  try {
    const body = JSON.parse(event.body ?? '{}') as { url?: string; botField?: string; turnstileToken?: string };
    url            = (body.url            ?? '').trim();
    botField       = (body.botField        ?? '').trim();
    turnstileToken = (body.turnstileToken  ?? '').trim();
  } catch {
    return { statusCode: 400, headers: JSON_HEADERS, body: json({ error: 'Invalid request body' }) };
  }

  // Honeypot — a real user never fills this. Return a benign queued response so
  // a bot can't distinguish rejection from success.
  if (botField) {
    return { statusCode: 200, headers: JSON_HEADERS, body: json({ status: 'queued' }) };
  }

  const clientIp = event.headers?.['x-nf-client-connection-ip'] || event.headers?.['x-forwarded-for'];
  if (!(await turnstilePassed(turnstileToken, clientIp))) {
    return { statusCode: 400, headers: JSON_HEADERS, body: json({ error: 'Bot verification failed. Please refresh and try again.' }) };
  }

  if (!url) {
    return { statusCode: 400, headers: JSON_HEADERS, body: json({ error: 'URL is required' }) };
  }

  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    new URL(normalized);
  } catch {
    return { statusCode: 400, headers: JSON_HEADERS, body: json({ error: 'Please enter a valid URL' }) };
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
    headers: JSON_HEADERS,
    body: json({
      status: 'queued',
      message: "Audit submitted — we'll have your report ready shortly.",
    }),
  };
};
