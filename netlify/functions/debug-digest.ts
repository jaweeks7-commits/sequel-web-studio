// TEMPORARY diagnostic — inspects the audit-leads store and can run the digest
// on demand, to tell whether scans are being stored vs whether the scheduled
// digest is failing to run. Token-gated; removed after diagnosis.
import { getStore } from '@netlify/blobs';
import { JSON_HEADERS, json } from '../lib/http';
import { connectBlobs } from '../lib/blobs';
import { runDigest } from './daily-digest';

const TOKEN = '6e2bfca331406bcb76820431c6816625c1f1';

type Event = { queryStringParameters?: Record<string, string | undefined> | null };

export const handler = async (event: Event) => {
  if ((event.queryStringParameters?.key ?? '') !== TOKEN) {
    return { statusCode: 404, headers: JSON_HEADERS, body: json({ error: 'Not found.' }) };
  }

  // Initialize Blobs from this request's event; runDigest() reuses the context.
  connectBlobs(event);

  // 1) What's currently queued in the audit-leads store?
  let storeInfo: unknown;
  try {
    const store = getStore('audit-leads');
    const { blobs } = await store.list();
    let firstEntry: unknown = null;
    if (blobs.length) {
      try { firstEntry = JSON.parse(((await store.get(blobs[0].key)) as unknown as string | null) ?? 'null'); } catch { firstEntry = 'unparseable'; }
    }
    storeInfo = { count: blobs.length, keys: blobs.map((b) => b.key).slice(0, 25), firstEntry };
  } catch (e) {
    storeInfo = { error: e instanceof Error ? e.message : String(e) };
  }

  // 2) Can a function read+write Blobs at all right now?
  let blobSelfTest: unknown;
  try {
    const store = getStore('audit-leads');
    const k = `__probe-${Date.now()}`;
    await store.set(k, 'ok');
    const v = (await store.get(k)) as unknown as string | null;
    await store.delete(k);
    blobSelfTest = v === 'ok' ? 'read/write/delete OK' : `unexpected read: ${v}`;
  } catch (e) {
    blobSelfTest = { error: e instanceof Error ? e.message : String(e) };
  }

  // 2b) Only when ?seed=1: write one realistic submission so the digest has
  // something to flush (used to verify the read/email/sheet path end-to-end,
  // since live scans are gated by Turnstile and can't be posted synthetically).
  let seedResult: unknown = 'skipped (add &seed=1)';
  if (event.queryStringParameters?.seed === '1') {
    try {
      const store = getStore('audit-leads');
      await store.set(
        `submission-${Date.now()}`,
        JSON.stringify({
          url: 'https://example.com/',
          scores: { performance: 92, seo: 50, ai: 10, mobile: 96, security: 65 },
          criticalCount: 2,
          submittedAt: new Date().toISOString(),
        }),
      );
      seedResult = 'seeded 1 test submission';
    } catch (e) {
      seedResult = { error: e instanceof Error ? e.message : String(e) };
    }
  }

  // 3) Only when ?run=1: actually run the digest (emails + appends + clears).
  let digestResult: unknown = 'skipped (add &run=1 to execute)';
  if (event.queryStringParameters?.run === '1') {
    try {
      digestResult = await runDigest();
    } catch (e) {
      digestResult = { threw: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
    }
  }

  return { statusCode: 200, headers: JSON_HEADERS, body: json({ storeInfo, blobSelfTest, seedResult, digestResult }) };
};
