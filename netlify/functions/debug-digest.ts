// TEMPORARY diagnostic — inspects the audit-leads store and can run the digest
// on demand, to tell whether scans are being stored vs whether the scheduled
// digest is failing to run. Token-gated; removed after diagnosis.
import { getStore } from '@netlify/blobs';
import { JSON_HEADERS, json } from '../lib/http';
import { handler as digestHandler } from './daily-digest';

const TOKEN = '6e2bfca331406bcb76820431c6816625c1f1';

type Event = { queryStringParameters?: Record<string, string | undefined> | null };

export const handler = async (event: Event) => {
  if ((event.queryStringParameters?.key ?? '') !== TOKEN) {
    return { statusCode: 404, headers: JSON_HEADERS, body: json({ error: 'Not found.' }) };
  }

  // 1) What's currently queued in the audit-leads store?
  let storeInfo: unknown;
  try {
    const store = getStore('audit-leads');
    const { blobs } = await store.list();
    let firstEntry: unknown = null;
    if (blobs.length) {
      try { firstEntry = JSON.parse((await store.get(blobs[0].key)) ?? 'null'); } catch { firstEntry = 'unparseable'; }
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
    const v = await store.get(k);
    await store.delete(k);
    blobSelfTest = v === 'ok' ? 'read/write/delete OK' : `unexpected read: ${v}`;
  } catch (e) {
    blobSelfTest = { error: e instanceof Error ? e.message : String(e) };
  }

  // 3) Only when ?run=1: actually run the digest (emails + appends + clears).
  let digestResult: unknown = 'skipped (add &run=1 to execute)';
  if (event.queryStringParameters?.run === '1') {
    try {
      digestResult = await digestHandler({});
    } catch (e) {
      digestResult = { threw: e instanceof Error ? `${e.name}: ${e.message}` : String(e) };
    }
  }

  return { statusCode: 200, headers: JSON_HEADERS, body: json({ storeInfo, blobSelfTest, digestResult }) };
};
