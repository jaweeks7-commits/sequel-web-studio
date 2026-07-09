import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Judgment call: using output:'static' (no adapter) for Phase 1 since all pages
// are fully pre-rendered. The @astrojs/netlify adapter will be added in Phase 2
// when the audit tool needs server-side rendering. The netlify.toml handles
// build config and Netlify Functions routing independently.
export default defineConfig({
  // Single source of truth is PUBLIC_SITE_URL (same var src/config/site.ts reads);
  // fall back to the production URL so a bare `astro build` still works.
  site: process.env.PUBLIC_SITE_URL || 'https://sequelwebstudio.com',
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    // /free-ai-audit is a noindex ad landing page — keep it out of the sitemap
    // so search engines aren't invited to a page that asks not to be indexed.
    sitemap({ filter: (page) => !page.includes('/free-ai-audit') }),
  ],
});
