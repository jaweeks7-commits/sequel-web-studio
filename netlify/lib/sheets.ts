// Appends free-audit requests to a Google Sheet via a service account.
//
// Dormant until all three env vars are set (GOOGLE_SHEETS_ID,
// GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY), mirroring the
// "no config = no-op" gating in turnstile.ts and conversions.ts so an
// unconfigured Sheet never breaks the daily digest. Called once per day from
// daily-digest.ts, never on the latency-sensitive scan path.

import { JWT } from 'google-auth-library';

const SHEET_RANGE = 'Sheet1!A:I'; // 9 columns; see daily-digest row shape

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
  // Netlify stores the private key with literal "\n" sequences; restore them.
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string).replace(/\\n/g, '\n');

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
