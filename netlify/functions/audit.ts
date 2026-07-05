import { getStore } from '@netlify/blobs';
import { JSON_HEADERS, json } from '../lib/http';
import { turnstilePassed } from '../lib/turnstile';
import { runScan } from '../lib/scan';

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

  // Run the real scan. A failure here is almost always an unreachable or
  // hostile target (DNS failure, timeout, 4xx/5xx), so surface it as a clean
  // 422 the front-end can turn into a friendly "we couldn't reach that site".
  let result: Awaited<ReturnType<typeof runScan>>;
  try {
    result = await runScan(normalized);
  } catch (err) {
    console.error(`[audit] Scan failed for ${normalized}:`, err);
    return {
      statusCode: 422,
      headers: JSON_HEADERS,
      body: json({
        error:
          "We couldn't reach that site to scan it. Double-check the address and try again.",
      }),
    };
  }

  // Store the lead in Netlify Blobs — picked up by the daily digest function.
  // Never fail the visitor's scan if storage is unavailable (e.g. local dev).
  try {
    const store = getStore('audit-leads');
    await store.set(
      `submission-${Date.now()}`,
      JSON.stringify({
        url: result.url,
        scores: result.scores,
        criticalCount: result.criticalCount,
        submittedAt: result.timestamp,
      }),
    );
  } catch (err) {
    console.error('[audit] Blob storage failed:', err);
  }

  console.log(`[audit] Scan complete: ${result.url}`, result.scores);

  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: json({ status: 'complete', ...result }),
  };
};
