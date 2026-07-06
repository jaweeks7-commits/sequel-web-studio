// TEMPORARY diagnostic endpoint — verifies the Google Sheet connection by
// writing one test row, so we can confirm the service-account credentials work
// without waiting for the 9 AM digest. This whole file is deleted right after
// the check, which makes the endpoint (and the disposable token below) inert.
import { JSON_HEADERS, json } from '../lib/http';
import { isSheetsConfigured, appendAuditRows } from '../lib/sheets';

// One-off token. Disposable: the function is removed after the test, so the
// token cannot be used again even though it lands in git history.
const TOKEN = '2f60ecd39b37bfc9cd18af54fde94b093df1';

type LambdaEvent = {
  httpMethod: string;
  queryStringParameters?: Record<string, string | undefined> | null;
};
type LambdaResponse = { statusCode: number; headers: Record<string, string>; body: string };

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  if ((event.queryStringParameters?.key ?? '') !== TOKEN) {
    return { statusCode: 404, headers: JSON_HEADERS, body: json({ error: 'Not found.' }) };
  }

  if (!isSheetsConfigured()) {
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: json({
        ok: false,
        reason:
          'Sheets is not fully configured. Check that all three env vars are set: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY.',
      }),
    };
  }

  const now = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  try {
    await appendAuditRows([
      [now, 'TEST (connection check)', 'https://sequelwebstudio.com', 100, 100, 100, 100, 100, 0],
    ]);
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: json({
        ok: true,
        message: 'Success. A TEST row was appended to your Google Sheet. You can delete that row whenever.',
      }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: json({ ok: false, error: err instanceof Error ? err.message : String(err) }),
    };
  }
};
