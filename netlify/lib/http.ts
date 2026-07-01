// Shared response helpers for Netlify Functions.
export const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const json = (data: unknown): string => JSON.stringify(data);
