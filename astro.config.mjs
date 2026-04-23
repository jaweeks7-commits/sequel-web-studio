import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Judgment call: using output:'static' (no adapter) for Phase 1 since all pages
// are fully pre-rendered. The @astrojs/netlify adapter will be added in Phase 2
// when the audit tool needs server-side rendering. The netlify.toml handles
// build config and Netlify Functions routing independently.
export default defineConfig({
  site: 'https://sequelwebstudio.com',
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
});
