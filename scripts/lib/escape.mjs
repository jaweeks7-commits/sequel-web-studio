// Escapes the three HTML-structural characters (& < >) in text destined for
// generated HTML. Intentionally does NOT escape quotes: standalone.code fields
// in audit JSON are pre-escaped and their quotes must be preserved verbatim.
// (This differs from the 5-character escaper in netlify/lib/escape.ts, which
// guards attribute contexts in email bodies.)
export function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
