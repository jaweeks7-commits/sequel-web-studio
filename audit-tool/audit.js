#!/usr/bin/env node
/**
 * Sequel Web Studio — Website Audit Tool
 *
 * Usage:
 *   node audit.js <url> [business-name]
 *
 * Examples:
 *   node audit.js https://greekcafekeller.com "Greek Cafe Keller"
 *   node audit.js thestraightedgelawns.com
 *
 * Outputs two files per audit into ./audits/:
 *   - <slug>-<date>.json   (raw findings, for future automation)
 *   - <slug>-<date>.md     (human-readable report)
 *
 * No external dependencies. Requires Node.js 18+.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// ---------- HTTP helper ----------

function fetchUrl(url, { timeout = 20000, redirects = 5 } = {}) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.request(
        {
          hostname: u.hostname,
          port: u.port || (u.protocol === 'https:' ? 443 : 80),
          path: u.pathname + u.search,
          method: 'GET',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; SequelWebStudioAudit/1.0; +https://sequelwebstudio.com)',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'identity',
          },
          timeout,
        },
        (res) => {
          if (
            [301, 302, 303, 307, 308].includes(res.statusCode) &&
            res.headers.location &&
            redirects > 0
          ) {
            const next = new URL(res.headers.location, url).toString();
            res.resume();
            return resolve(fetchUrl(next, { timeout, redirects: redirects - 1 }));
          }
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () =>
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              headers: res.headers,
              body,
              finalUrl: url,
            })
          );
        }
      );
      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'timeout' });
      });
      req.on('error', (err) => resolve({ ok: false, error: err.message }));
      req.end();
    } catch (err) {
      resolve({ ok: false, error: err.message });
    }
  });
}

// ---------- Check helpers ----------
// Each check returns: { code, label, section, finding, note }
// finding: 'pass' | 'fail' | 'info'

const SECTION_A = 'Visible Opportunities';
const SECTION_B = 'AI-Era Foundation';

function checkHttps(url) {
  const isHttps = url.startsWith('https://');
  return {
    code: 'A6',
    label: 'HTTPS',
    section: SECTION_A,
    finding: isHttps ? 'pass' : 'fail',
    note: isHttps
      ? 'Site serves over HTTPS.'
      : 'Site does NOT use HTTPS. Browsers show a "Not Secure" warning — critical trust issue.',
  };
}

function checkViewport(html) {
  const m = html.match(/<meta[^>]+name=["']viewport["'][^>]*>/i);
  return {
    code: 'A1',
    label: 'Mobile viewport meta tag',
    section: SECTION_A,
    finding: m ? 'pass' : 'fail',
    note: m
      ? `Present: ${m[0].slice(0, 120)}`
      : 'No <meta name="viewport"> tag. Page will render at desktop width on phones — text tiny, layout broken.',
  };
}

function checkFooterYear(html) {
  const currentYear = new Date().getFullYear();
  const matches = [
    ...html.matchAll(/(?:©|&copy;|copyright)[^0-9]{0,40}(\d{4})/gi),
  ].map((x) => parseInt(x[1], 10));
  if (!matches.length) {
    return {
      code: 'A3',
      label: 'Footer copyright year',
      section: SECTION_A,
      finding: 'info',
      note: 'No explicit copyright year detected on the home page.',
    };
  }
  const maxYear = Math.max(...matches);
  const stale = maxYear < currentYear - 1;
  const ok = maxYear >= currentYear;
  return {
    code: 'A3',
    label: 'Footer copyright year',
    section: SECTION_A,
    finding: stale ? 'fail' : ok ? 'pass' : 'info',
    note: stale
      ? `Footer shows ${maxYear} (current year is ${currentYear}) — site looks abandoned.`
      : ok
      ? `Footer copyright current (${maxYear}).`
      : `Footer shows ${maxYear} — slightly behind current year (${currentYear}).`,
  };
}

function checkContactForm(html) {
  const hasForm = /<form\b/i.test(html);
  const hasMailto = /mailto:/i.test(html);
  const hasTel = /href=["']tel:/i.test(html);
  const signals = [];
  if (hasForm) signals.push('form');
  if (hasMailto) signals.push('mailto: link');
  if (hasTel) signals.push('tel: link');
  return {
    code: 'A5',
    label: 'Contact method on home page',
    section: SECTION_A,
    finding: signals.length ? 'pass' : 'fail',
    note: signals.length
      ? `Detected: ${signals.join(', ')}.`
      : 'No form, mailto: link, or tel: link detected on the home page.',
  };
}

function checkAnalytics(html) {
  const patterns = [
    /gtag\s*\(/i,
    /googletagmanager\.com/i,
    /google-analytics\.com/i,
    /\bG-[A-Z0-9]{6,}\b/,
    /\bUA-\d{4,}-\d+\b/,
    /fbq\s*\(/i, // Meta pixel
    /clarity\.ms/i, // MS Clarity
  ];
  const hits = patterns.filter((p) => p.test(html));
  return {
    code: 'A11',
    label: 'Analytics / tracking installed',
    section: SECTION_A,
    finding: hits.length ? 'pass' : 'fail',
    note: hits.length
      ? `Detected ${hits.length} analytics/tracking signal(s).`
      : 'No analytics tags detected — owner has no visibility into who visits.',
  };
}

function checkSocialLinks(html) {
  const socials = [
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'tiktok.com',
    'youtube.com',
    'pinterest.com',
  ];
  const found = socials.filter((s) =>
    new RegExp(`href=["'][^"']*${s.replace(/\./g, '\\.')}`, 'i').test(html)
  );
  return {
    code: 'A12',
    label: 'Social media links',
    section: SECTION_A,
    finding: found.length ? 'pass' : 'info',
    note: found.length
      ? `Links to: ${found.join(', ')}.`
      : 'No social media links detected on the home page.',
  };
}

function checkGBPLink(html) {
  const hasMapsLink =
    /(maps\.google\.com|goo\.gl\/maps|g\.page|google\.com\/maps|maps\.app\.goo\.gl)/i.test(
      html
    );
  return {
    code: 'A10',
    label: 'Google Business Profile / Maps link',
    section: SECTION_A,
    finding: hasMapsLink ? 'pass' : 'info',
    note: hasMapsLink
      ? 'Google Maps / Business Profile link detected.'
      : 'No Google Maps or Business Profile link detected on the home page.',
  };
}

function checkImages(html) {
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  if (!imgs.length) {
    return {
      code: 'A4',
      label: 'Images — alt text coverage',
      section: SECTION_A,
      finding: 'info',
      note: 'No <img> tags detected on the home page.',
    };
  }
  const missing = imgs.filter(
    (tag) => !/\balt\s*=\s*["'][^"']/i.test(tag)
  ).length;
  const pct = Math.round(((imgs.length - missing) / imgs.length) * 100);
  return {
    code: 'A4',
    label: 'Images — alt text coverage',
    section: SECTION_A,
    finding: pct >= 80 ? 'pass' : 'fail',
    note:
      pct >= 80
        ? `${imgs.length} images, ${pct}% have alt text.`
        : `${imgs.length} images, only ${pct}% have alt text. Missing alt hurts accessibility AND SEO.`,
  };
}

function checkFavicon(html) {
  const has = /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/i.test(html);
  return {
    code: 'A7',
    label: 'Favicon',
    section: SECTION_A,
    finding: has ? 'pass' : 'fail',
    note: has
      ? 'Favicon link tag present.'
      : 'No favicon link tag. Browser tabs show a blank icon — looks amateur.',
  };
}

function checkTitleAndDescription(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const desc =
    (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      [])[1] || '';
  const titleOk = title.trim().length >= 10 && title.trim().length <= 70;
  const descOk = desc.trim().length >= 50 && desc.trim().length <= 170;
  const finding = titleOk && descOk ? 'pass' : 'fail';
  const issues = [];
  if (!title.trim()) issues.push('no <title>');
  else if (!titleOk) issues.push(`title length ${title.trim().length} (ideal 10-70)`);
  if (!desc.trim()) issues.push('no meta description');
  else if (!descOk)
    issues.push(`description length ${desc.trim().length} (ideal 50-170)`);
  return {
    code: 'A8',
    label: 'Page title & meta description',
    section: SECTION_A,
    finding,
    note:
      finding === 'pass'
        ? `Title: "${title.trim().slice(0, 70)}" | Description set.`
        : `Issues: ${issues.join('; ')}. Title: "${title.trim().slice(0, 70)}".`,
  };
}

function checkSchemaOrg(html) {
  const matches = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];
  if (!matches.length) {
    return {
      code: 'B1',
      label: 'schema.org JSON-LD structured data',
      section: SECTION_B,
      finding: 'fail',
      note:
        'No JSON-LD structured data found. Business details (name, address, hours, reviews) are not machine-readable — AI assistants and rich results can\'t use them.',
    };
  }
  const types = [];
  for (const m of matches) {
    try {
      const json = JSON.parse(m[1].trim());
      const collect = (node) => {
        if (Array.isArray(node)) node.forEach(collect);
        else if (node && typeof node === 'object') {
          if (node['@type']) {
            types.push(
              Array.isArray(node['@type']) ? node['@type'].join('+') : node['@type']
            );
          }
          if (node['@graph']) collect(node['@graph']);
        }
      };
      collect(json);
    } catch (e) {
      types.push('(parse-error)');
    }
  }
  const unique = [...new Set(types)];
  const hasBusinessType = unique.some((t) =>
    /(LocalBusiness|Restaurant|Organization|Service|ProfessionalService|HomeAndConstructionBusiness)/i.test(
      t
    )
  );
  return {
    code: 'B1',
    label: 'schema.org JSON-LD structured data',
    section: SECTION_B,
    finding: hasBusinessType ? 'pass' : 'info',
    note: `Found ${matches.length} JSON-LD block(s). Types: ${
      unique.join(', ') || 'unknown'
    }.${hasBusinessType ? '' : ' No LocalBusiness/Organization/Service type — key business info still not machine-readable.'}`,
  };
}

function checkOpenGraph(html) {
  const og = [
    ...html.matchAll(/<meta[^>]+property=["']og:([^"']+)["'][^>]*>/gi),
  ].map((m) => m[1]);
  const twitter = [
    ...html.matchAll(/<meta[^>]+name=["']twitter:([^"']+)["'][^>]*>/gi),
  ].map((m) => m[1]);
  const hasTitle = og.includes('title');
  const hasDescription = og.includes('description');
  const hasImage = og.includes('image');
  const critical = hasTitle && hasDescription && hasImage;
  return {
    code: 'B4',
    label: 'Open Graph & Twitter Card tags',
    section: SECTION_B,
    finding: critical ? 'pass' : 'fail',
    note: critical
      ? `og: [${og.join(', ')}]${
          twitter.length ? ` | twitter: [${twitter.join(', ')}]` : ''
        }.`
      : `Missing critical social preview tags. og: [${
          og.join(', ') || 'none'
        }], twitter: [${
          twitter.join(', ') || 'none'
        }]. When the site is shared on Facebook/LinkedIn/iMessage it will look broken.`,
  };
}

function checkSemanticHtml(html) {
  const tags = ['<main', '<header', '<footer', '<nav', '<article', '<section'];
  const found = tags.filter((t) => new RegExp(t + '\\b', 'i').test(html));
  return {
    code: 'B7',
    label: 'Semantic HTML structure',
    section: SECTION_B,
    finding: found.length >= 3 ? 'pass' : 'fail',
    note:
      found.length >= 3
        ? `Uses: ${found.join(', ')}.`
        : `Only found: ${
            found.join(', ') || 'none'
          }. Page is mostly <div> soup — harder for assistive tech and AI parsers to understand.`,
  };
}

async function checkRobots(baseUrl) {
  const u = new URL('/robots.txt', baseUrl).toString();
  const res = await fetchUrl(u);
  if (!res.ok || !res.body) {
    return {
      code: 'B3',
      label: 'robots.txt — AI crawler directives',
      section: SECTION_B,
      finding: 'fail',
      note: `No robots.txt at ${u} (status ${res.status || res.error}). Can't steer AI crawlers.`,
    };
  }
  const bots = [
    'GPTBot',
    'ClaudeBot',
    'anthropic-ai',
    'Google-Extended',
    'PerplexityBot',
    'CCBot',
    'Bytespider',
  ];
  const mentioned = bots.filter((b) =>
    new RegExp(`User-agent:\\s*${b}`, 'i').test(res.body)
  );
  const blocksAll =
    /User-agent:\s*\*[\s\S]*?Disallow:\s*\/\s*(?:\n|$)/im.test(res.body);
  return {
    code: 'B3',
    label: 'robots.txt — AI crawler directives',
    section: SECTION_B,
    finding: mentioned.length ? 'pass' : 'info',
    note: mentioned.length
      ? `robots.txt explicitly addresses: ${mentioned.join(', ')}.`
      : blocksAll
      ? 'robots.txt BLOCKS ALL crawlers with "User-agent: * / Disallow: /" — site is invisible to search and AI.'
      : 'robots.txt exists but does not mention any AI crawlers (GPTBot, ClaudeBot, Google-Extended, PerplexityBot). Owner has no explicit policy.',
  };
}

async function checkLlmsTxt(baseUrl) {
  const u = new URL('/llms.txt', baseUrl).toString();
  const res = await fetchUrl(u);
  const looksLikeHtml = res.body && /<html|<!doctype/i.test(res.body.slice(0, 200));
  const ok = res.ok && res.body && res.body.trim().length > 0 && !looksLikeHtml;
  return {
    code: 'B2',
    label: 'llms.txt (AI assistant context file)',
    section: SECTION_B,
    finding: ok ? 'pass' : 'fail',
    note: ok
      ? `llms.txt found (${res.body.length} bytes).`
      : 'No llms.txt at /llms.txt. Business is not providing structured context to AI assistants — competitors who do will be preferred in AI answers.',
  };
}

async function checkSitemap(baseUrl) {
  const u = new URL('/sitemap.xml', baseUrl).toString();
  const res = await fetchUrl(u);
  const ok = res.ok && res.body && /<urlset|<sitemapindex/i.test(res.body);
  const urlCount = ok ? (res.body.match(/<loc>/gi) || []).length : 0;
  return {
    code: 'B6',
    label: 'XML sitemap',
    section: SECTION_B,
    finding: ok ? 'pass' : 'fail',
    note: ok
      ? `sitemap.xml found with ${urlCount} URL(s).`
      : `No sitemap.xml at ${u} (status ${res.status || res.error}). Search engines have to discover pages on their own.`,
  };
}

async function checkPageSpeed(url, apiKey = process.env.PSI_API_KEY) {
  const endpoint =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(url)}` +
    `&strategy=mobile` +
    `&category=performance` +
    (apiKey ? `&key=${apiKey}` : '');
  const res = await fetchUrl(endpoint, { timeout: 75000 });
  if (!res.ok) {
    return {
      code: 'B5',
      label: 'Core Web Vitals (mobile)',
      section: SECTION_B,
      finding: 'info',
      note: `PageSpeed Insights fetch failed: ${res.error || `status ${res.status}`}.`,
    };
  }
  try {
    const data = JSON.parse(res.body);
    const lh = data.lighthouseResult;
    const perf = lh?.categories?.performance?.score;
    const audits = lh?.audits || {};
    const lcp = audits['largest-contentful-paint']?.displayValue;
    const cls = audits['cumulative-layout-shift']?.displayValue;
    const tbt = audits['total-blocking-time']?.displayValue;
    const fcp = audits['first-contentful-paint']?.displayValue;
    const score = perf !== undefined ? Math.round(perf * 100) : null;
    if (score === null) {
      return {
        code: 'B5',
        label: 'Core Web Vitals (mobile)',
        section: SECTION_B,
        finding: 'info',
        note: 'PageSpeed Insights returned no performance score.',
      };
    }
    return {
      code: 'B5',
      label: 'Core Web Vitals (mobile)',
      section: SECTION_B,
      finding: score >= 75 ? 'pass' : score >= 50 ? 'info' : 'fail',
      note: `Performance score: ${score}/100 | LCP: ${lcp || '?'} | CLS: ${cls || '?'} | TBT: ${tbt || '?'} | FCP: ${fcp || '?'}.`,
    };
  } catch (e) {
    return {
      code: 'B5',
      label: 'Core Web Vitals (mobile)',
      section: SECTION_B,
      finding: 'info',
      note: `PageSpeed response parse error: ${e.message}.`,
    };
  }
}

function summarizeAIRetrievability(checks) {
  const ids = ['B1', 'B2', 'B3', 'B4', 'B6'];
  const relevant = checks.filter((c) => ids.includes(c.code));
  const passed = relevant.filter((c) => c.finding === 'pass').length;
  return {
    code: 'B8',
    label: 'AI assistant retrievability (summary)',
    section: SECTION_B,
    finding: passed >= 4 ? 'pass' : passed >= 2 ? 'info' : 'fail',
    note: `${passed} of ${ids.length} AI-era signals pass (schema.org, llms.txt, robots AI directives, Open Graph, sitemap). The fewer signals, the less likely this business surfaces when customers ask an AI assistant.`,
  };
}

// ---------- Runner ----------

async function run() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('-h') || args.includes('--help')) {
    console.log(
      `\nSequel Web Studio — Website Audit\n\n` +
        `Usage:\n  node audit.js <url> [business-name]\n\n` +
        `Examples:\n` +
        `  node audit.js https://greekcafekeller.com "Greek Cafe Keller"\n` +
        `  node audit.js thestraightedgelawns.com\n`
    );
    process.exit(0);
  }

  let url = args[0];
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const businessName = args.slice(1).join(' ') || new URL(url).hostname;

  console.log(`\nAuditing ${url}`);
  console.log(`(this takes 30–75 seconds because of the PageSpeed check)\n`);

  // Fetch main page
  const main = await fetchUrl(url);
  if (!main.ok) {
    console.error(
      `FAILED to fetch ${url}: ${main.error || `status ${main.status}`}`
    );
    process.exit(1);
  }
  const html = main.body;
  const baseUrl = new URL(url).origin;

  const checks = [];

  // Section A — HTML-only checks
  checks.push(checkHttps(url));
  checks.push(checkViewport(html));
  checks.push(checkFooterYear(html));
  checks.push(checkContactForm(html));
  checks.push(checkImages(html));
  checks.push(checkFavicon(html));
  checks.push(checkTitleAndDescription(html));
  checks.push(checkAnalytics(html));
  checks.push(checkSocialLinks(html));
  checks.push(checkGBPLink(html));

  // Section B — HTML + secondary fetches + API
  checks.push(checkSchemaOrg(html));
  checks.push(checkOpenGraph(html));
  checks.push(checkSemanticHtml(html));
  console.log('  … fetching /robots.txt, /llms.txt, /sitemap.xml');
  const [robots, llms, sitemap] = await Promise.all([
    checkRobots(baseUrl),
    checkLlmsTxt(baseUrl),
    checkSitemap(baseUrl),
  ]);
  checks.push(robots, llms, sitemap);
  console.log('  … running PageSpeed Insights (mobile)');
  checks.push(await checkPageSpeed(url));
  checks.push(summarizeAIRetrievability(checks));

  // Sort by code
  checks.sort((a, b) => a.code.localeCompare(b.code));

  // Summary counts
  const counts = checks.reduce(
    (acc, c) => {
      acc[c.finding] = (acc[c.finding] || 0) + 1;
      return acc;
    },
    { pass: 0, fail: 0, info: 0 }
  );

  // Priority fixes = fails, Section B first, then Section A
  const priorityFixes = checks
    .filter((c) => c.finding === 'fail')
    .sort((a, b) => {
      if (a.section !== b.section) return a.section === SECTION_B ? -1 : 1;
      return a.code.localeCompare(b.code);
    });

  // Output
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const outDir = path.join(__dirname, 'audits');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `${slug}-${stamp}.json`);
  const mdPath = path.join(outDir, `${slug}-${stamp}.md`);

  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      { url, businessName, date: stamp, counts, checks },
      null,
      2
    )
  );

  const badge = (f) =>
    f === 'pass' ? '[PASS]' : f === 'fail' ? '[FAIL]' : '[INFO]';

  const renderChecks = (section) =>
    checks
      .filter((c) => c.section === section)
      .map((c) => `- ${badge(c.finding)} **${c.code} — ${c.label}** — ${c.note}`)
      .join('\n');

  const md = [
    `# Website Audit — ${businessName}`,
    ``,
    `- **URL:** ${url}`,
    `- **Date:** ${stamp}`,
    `- **Summary:** ${counts.pass} pass · ${counts.fail} fail · ${counts.info} info`,
    ``,
    `## Priority Fixes`,
    ``,
    priorityFixes.length
      ? priorityFixes
          .map(
            (c) =>
              `1. **${c.code} — ${c.label}** (${c.section}) — ${c.note}`
          )
          .join('\n')
      : '_No FAIL findings — this site is in solid shape._',
    ``,
    `## Section A — ${SECTION_A}`,
    ``,
    renderChecks(SECTION_A),
    ``,
    `## Section B — ${SECTION_B}`,
    ``,
    renderChecks(SECTION_B),
    ``,
    `---`,
    `_Generated by Sequel Web Studio audit tool._`,
    ``,
  ].join('\n');

  fs.writeFileSync(mdPath, md);

  console.log('\n' + md);
  console.log(`\nSaved:\n  ${jsonPath}\n  ${mdPath}\n`);
}

run().catch((err) => {
  console.error('Audit crashed:', err);
  process.exit(1);
});
