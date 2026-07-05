// Real "Free Lite Audit" scan engine.
//
// Given a URL, this fetches the live page (plus /robots.txt and /llms.txt) and
// derives five category scores the front-end already renders: Performance,
// SEO / Discoverability, AI Readiness, Mobile Experience, Security & Compliance.
//
// Four of the five categories are scored entirely from the fast HTML + header
// fetch, so the scan is credible and site-specific even when Google PageSpeed
// Insights is slow or unavailable. PSI is used only to sharpen the Performance
// score, gated behind PAGESPEED_API_KEY and hard-capped at ~8s with a TTFB-based
// fallback — the scan never hangs waiting on it. See CLAUDE.md "Key technical
// risk" in the free-scan plan.

export interface ScanScores {
  performance: number;
  seo: number;
  ai: number;
  mobile: number;
  security: number;
}

export interface ScanResult {
  url: string;
  scores: ScanScores;
  criticalCount: number;
  timestamp: string;
}

// Budgets are tuned so the whole scan stays under Netlify's 10s synchronous
// function limit. PSI runs in parallel with the HTML + side-file fetches (it
// hits the target URL itself, independent of our fetch), so the wall-clock cost
// is max(HTML + side, PSI), not their sum.
const HTML_FETCH_TIMEOUT_MS = 6000;
const SIDE_FETCH_TIMEOUT_MS = 2500;
const PSI_TIMEOUT_MS = 7000;

// A desktop-ish UA — some sites gate or 403 unknown agents. Keep it honest.
const UA =
  'Mozilla/5.0 (compatible; SequelWebStudioAudit/1.0; +https://sequelwebstudio.com/audit)';

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  return fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
    signal: AbortSignal.timeout(timeoutMs),
  });
}

// Fetch a small side file (robots.txt, llms.txt). Returns null on any failure —
// its absence is itself a signal, never an error.
async function fetchSideFile(base: URL, path: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(new URL(path, base).href, SIDE_FETCH_TIMEOUT_MS);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

interface HtmlSignals {
  hasTitle: boolean;
  titleGoodLength: boolean;
  hasMetaDesc: boolean;
  metaDescGoodLength: boolean;
  hasCanonical: boolean;
  h1Count: number;
  isNoindex: boolean;
  hasViewport: boolean;
  hasLang: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasJsonLd: boolean;
  hasBusinessSchema: boolean;
  imgTotal: number;
  imgWithAlt: number;
  bytes: number;
}

function parseHtml(html: string): HtmlSignals {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const metaDescMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i,
  );
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';

  const robotsMatch = html.match(
    /<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)["']/i,
  );
  const isNoindex = robotsMatch ? /noindex/i.test(robotsMatch[1]) : false;

  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;

  const jsonLdBlocks =
    html.match(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ) || [];
  const hasBusinessSchema = jsonLdBlocks.some((b) =>
    /"@type"\s*:\s*["'](?:[^"']*)?(?:LocalBusiness|Organization|ProfessionalService)/i.test(b),
  );

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imgWithAlt = imgTags.filter((t) =>
    /\balt\s*=\s*["'][^"']+["']/i.test(t),
  ).length;

  return {
    hasTitle: title.length > 0,
    titleGoodLength: title.length >= 10 && title.length <= 65,
    hasMetaDesc: metaDesc.length > 0,
    metaDescGoodLength: metaDesc.length >= 50 && metaDesc.length <= 160,
    hasCanonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    h1Count,
    isNoindex,
    hasViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    hasLang: /<html[^>]+\blang\s*=/i.test(html),
    hasOpenGraph: /<meta[^>]+property=["']og:/i.test(html),
    hasTwitterCard: /<meta[^>]+name=["']twitter:/i.test(html),
    hasJsonLd: jsonLdBlocks.length > 0,
    hasBusinessSchema,
    imgTotal: imgTags.length,
    imgWithAlt,
    bytes: html.length,
  };
}

// Best-effort PSI performance score (0-100). Returns null when the key is
// missing, the call times out, or the response is unusable.
async function fetchPsiPerformance(url: string): Promise<number | null> {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return null;
  const endpoint =
    'https://www.googleapis.com/pagespeedonline/v5/runPagespeed' +
    `?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${key}`;
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(PSI_TIMEOUT_MS) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      lighthouseResult?: { categories?: { performance?: { score?: number } } };
    };
    const score = data.lighthouseResult?.categories?.performance?.score;
    return typeof score === 'number' ? clamp(score * 100) : null;
  } catch {
    return null;
  }
}

// TTFB-based performance estimate when PSI is unavailable. Deliberately
// conservative: a fast first byte is necessary but not sufficient, so the
// ceiling is 92, not 100.
function performanceFromTtfb(ttfbMs: number, bytes: number): number {
  let score: number;
  if (ttfbMs < 200) score = 92;
  else if (ttfbMs < 500) score = 84;
  else if (ttfbMs < 1000) score = 70;
  else if (ttfbMs < 2000) score = 52;
  else if (ttfbMs < 4000) score = 34;
  else score = 18;
  // Heavy HTML payloads (before images/scripts) hint at slow rendering.
  if (bytes > 400_000) score -= 12;
  else if (bytes > 200_000) score -= 6;
  return clamp(score);
}

export async function runScan(inputUrl: string): Promise<ScanResult> {
  const normalized = /^https?:\/\//i.test(inputUrl) ? inputUrl : `https://${inputUrl}`;

  // Start PSI immediately, in parallel with the HTML fetch. It resolves the
  // URL (and its redirects) itself, so it doesn't need our finalUrl.
  const psiPromise = fetchPsiPerformance(normalized);

  const started = Date.now();
  const res = await fetchWithTimeout(normalized, HTML_FETCH_TIMEOUT_MS);
  const ttfbMs = Date.now() - started;
  const html = await res.text();

  const finalUrl = new URL(res.url || normalized);
  const isHttps = finalUrl.protocol === 'https:';
  const headers = res.headers;
  const hasHsts = headers.has('strict-transport-security');
  const hasXcto = (headers.get('x-content-type-options') || '').toLowerCase().includes('nosniff');
  const hasReferrerPolicy = headers.has('referrer-policy');

  const s = parseHtml(html);

  const [robots, llms] = await Promise.all([
    fetchSideFile(finalUrl, '/robots.txt'),
    fetchSideFile(finalUrl, '/llms.txt'),
  ]);
  const hasLlms = llms !== null && llms.trim().length > 0;
  // "Blocks AI" = an explicit Disallow: / under a known AI crawler user-agent.
  const robotsBlocksAi =
    robots !== null &&
    /User-agent:\s*(GPTBot|ClaudeBot|PerplexityBot|Google-Extended|CCBot)[\s\S]*?Disallow:\s*\//i.test(robots);

  // ── SEO / Discoverability ──────────────────────────────────────────────
  let seo = 0;
  if (s.hasTitle) seo += 25;
  if (s.titleGoodLength) seo += 10;
  if (s.hasMetaDesc) seo += 25;
  if (s.metaDescGoodLength) seo += 10;
  if (s.hasCanonical) seo += 15;
  if (s.h1Count === 1) seo += 15;
  else if (s.h1Count > 1) seo += 6;
  if (s.isNoindex) seo = Math.min(seo, 20); // noindex is disqualifying for discoverability

  // ── AI Readiness ───────────────────────────────────────────────────────
  let ai = 0;
  if (s.hasJsonLd) ai += 30;
  if (s.hasBusinessSchema) ai += 15;
  if (hasLlms) ai += 20;
  if (s.hasOpenGraph) ai += 15;
  if (s.hasTwitterCard) ai += 10;
  if (s.hasLang) ai += 10;
  if (robotsBlocksAi) ai = Math.min(ai, 25); // actively blocking AI crawlers caps it

  // ── Performance ────────────────────────────────────────────────────────
  const psiPerf = await psiPromise;
  const performance = psiPerf ?? performanceFromTtfb(ttfbMs, s.bytes);

  // ── Mobile Experience ──────────────────────────────────────────────────
  // Viewport is the gate; the rendering speed signal (PSI or TTFB fallback)
  // carries the rest, since a slow page is a poor mobile experience.
  let mobile: number;
  if (!s.hasViewport) mobile = 30;
  else mobile = clamp(45 + performance * 0.55);

  // ── Security & Compliance ──────────────────────────────────────────────
  let security = 0;
  if (isHttps) security += 30;
  if (hasHsts) security += 15;
  if (hasXcto) security += 10;
  if (hasReferrerPolicy) security += 10;
  if (s.hasLang) security += 10;
  const altRatio = s.imgTotal === 0 ? 1 : s.imgWithAlt / s.imgTotal;
  security += Math.round(altRatio * 25);

  // ── Critical issue count (red-tier hard failures) ──────────────────────
  const critical = [
    !s.hasTitle,
    !s.hasMetaDesc,
    !isHttps,
    !s.hasViewport,
    !s.hasJsonLd,
    s.isNoindex,
  ].filter(Boolean).length;

  return {
    url: finalUrl.href,
    scores: {
      performance: clamp(performance),
      seo: clamp(seo),
      ai: clamp(ai),
      mobile: clamp(mobile),
      security: clamp(security),
    },
    criticalCount: critical,
    timestamp: new Date().toISOString(),
  };
}
