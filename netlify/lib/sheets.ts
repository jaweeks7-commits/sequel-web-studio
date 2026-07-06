// Appends free-audit requests to a Google Sheet via a service account.
//
// Dormant until all three env vars are set (GOOGLE_SHEETS_ID,
// GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY), mirroring the
// "no config = no-op" gating in turnstile.ts and conversions.ts so an
// unconfigured Sheet never breaks the daily digest. Called once per day from
// daily-digest.ts, never on the latency-sensitive scan path.

import { JWT } from 'google-auth-library';

const SHEET_RANGE = 'Sheet1!A:I'; // 9 columns; see daily-digest row shape

// Turn whatever ended up in the env var back into a valid PEM. Handles the
// common paste hazards: surrounding quotes copied along with the JSON value,
// and newlines stored as escaped "\n" or double-escaped "\\n" rather than real
// line breaks.
export function normalizePrivateKey(raw: string): string {
  let key = (raw ?? '').trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  // Collapse one-or-more backslashes before an n (\n, \\n) into a real newline.
  key = key.replace(/\\+n/g, '\n');
  return key;
}

export function isSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEETS_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  );
}

export async function appendAuditRows(rows: (string | number)[][]): Promise<void> {
  if (!isSheetsConfigured() || rows.length === 0) return;

  const sheetId = process.env.GOOGLE_SHEETS_ID as string;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string;
  const key = normalizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string);

  const client = new JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Sheets auth failed: no access token returned');

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
    `/values/${encodeURIComponent(SHEET_RANGE)}:append?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: rows }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Sheets append failed: ${res.status} ${detail.slice(0, 200)}`);
  }
}
