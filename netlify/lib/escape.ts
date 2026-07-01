// Escaping helpers shared across functions that render untrusted input into
// email bodies. Values originate from public forms, so every one must be
// HTML-escaped before it lands in markup. URLs used in an href also need a
// scheme check — escaping alone does not stop a `javascript:`/`data:` link.

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Returns the URL only if it is a plain http(s) link; otherwise an empty string
// so a crafted `javascript:`/`data:` value cannot become a live href.
export function safeHref(url: string): string {
  return /^https?:\/\//i.test(url.trim()) ? url.trim() : '';
}
