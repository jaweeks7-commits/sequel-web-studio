export const layers = [
  {
    num: '01', title: 'SEO Fundamentals', sub: 'Your site speaks Google\'s language from day one.',
    items: [
      "Keyword-optimized page title tag on every page",
      "Unique, compelling meta description for every page",
      "Proper canonical URL tag to consolidate ranking authority",
      "Meta robots tag explicitly set to index and follow",
      "Single, keyword-rich H1 with a logical H2/H3 heading hierarchy",
    ],
  },
  {
    num: '02', title: 'Social & Open Graph', sub: 'Your brand looks sharp everywhere it gets shared.',
    items: [
      "og:image set so every shared link shows a real branded image",
      "og:title, og:description, og:url, and og:type fully configured",
      "Twitter/X Card tags set for large image preview format",
      "All social preview behavior tested before launch",
    ],
  },
  {
    num: '03', title: 'Performance & Speed', sub: 'Fast for real visitors, not just lab scores.',
    items: [
      "Server response time (TTFB) optimized at the hosting level",
      "Images converted to modern WebP format with lazy loading enabled",
      "JavaScript loaded with async/defer so it never blocks rendering",
      "Third-party scripts audited and unnecessary ones removed",
      "Target: full page load under 3 seconds on real mobile connections",
    ],
  },
  {
    num: '04', title: 'Schema & Structured Data', sub: 'Search engines and AI assistants know exactly who you are.',
    items: [
      "JSON-LD schema blocks for Organization, LocalBusiness, and relevant service types",
      "Schema entities cross-linked via @id references for a coherent knowledge graph entry",
      "WebSite schema with SearchAction for Sitelink Searchbox eligibility",
      "FAQPage and/or HowTo schema where applicable for AI Overview eligibility",
      "BreadcrumbList schema on inner pages",
    ],
  },
  {
    num: '05', title: 'Analytics & Tracking', sub: 'Your data is clean, accurate, and actually usable.',
    items: [
      "Google Analytics 4 installed and verified against your GA4 property ID",
      "Tracking confirmed to fire once per event — no duplicate pixel errors",
      "Complete third-party script inventory documented at launch",
      "No orphaned or unknown scripts from previous developers or platforms",
    ],
  },
  {
    num: '06', title: 'Security & Crawlability', sub: 'No broken doors. No accidental stop signs for Google.',
    items: [
      "robots.txt reviewed and confirmed to allow indexing of all public pages",
      "Full HTTPS implementation with no mixed content errors",
      "Valid SSL certificate with correct HTTP to HTTPS redirect chain",
      "All external links set with rel=\"noopener noreferrer\" for security",
      "llms.txt file created so AI crawlers understand your content",
    ],
  },
  {
    num: '07', title: 'Accessibility', sub: 'Usable by everyone. Required by law in many jurisdictions.',
    items: [
      "Alt text written for every image — descriptive, not generic",
      "lang attribute declared on the HTML element",
      "Sufficient color contrast ratios across all text elements",
      "Logical tab order and keyboard navigability confirmed",
      "Basic WCAG 2.1 Level A compliance at launch",
    ],
  },
  {
    num: '08', title: 'AI Discoverability', sub: 'You show up when people ask ChatGPT, Perplexity, or Siri.',
    items: [
      "robots.txt explicitly opts in GPTBot, ClaudeBot, Google-Extended, and PerplexityBot",
      "llms.txt file written for your specific business — what you do, how to describe you, what not to say",
      "FAQ content structured for voice search so Siri and Alexa can quote you",
      "Schema types selected and implemented for AI Overview eligibility",
      "Google Business Profile integration with consistent Name/Address/Phone across the web",
    ],
  },
];
