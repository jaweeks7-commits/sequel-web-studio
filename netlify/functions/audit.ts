import { getStore } from '@netlify/blobs';

type LambdaEvent = {
  httpMethod: string;
  body: string | null;
};

type LambdaResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const JSON_CT = { 'Content-Type': 'application/json' };
const json = (data: unknown) => JSON.stringify(data);

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: JSON_CT, body: json({ error: 'Method not allowed' }) };
  }

  let url: string;
  try {
    const body = JSON.parse(event.body ?? '{}') as { url?: string };
    url = (body.url ?? '').trim();
  } catch {
    return { statusCode: 400, headers: JSON_CT, body: json({ error: 'Invalid request body' }) };
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
