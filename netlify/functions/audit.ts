// Stub Netlify Function for the audit tool.
// Phase 2 will replace the stub body with: Google PageSpeed Insights API call,
// basic on-page SEO scraping, Google Sheets lead write, and a real result URL.

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

  // Normalize so new URL() can validate even if the caller omitted the protocol
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    new URL(normalized);
  } catch {
    return { statusCode: 400, headers: JSON_CT, body: json({ error: 'Please enter a valid URL' }) };
  }

  console.log(`[audit] Submission queued: ${normalized}`);

  return {
    statusCode: 200,
    headers: JSON_CT,
    body: json({
      status: 'queued',
      message: "Audit submitted — we'll have your report ready shortly.",
    }),
  };
};
