import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.1)"/>
    </pattern>
    <linearGradient id="tealGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00bcd4"/>
      <stop offset="100%" stop-color="#0097a7"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#0F1F3D"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- Left teal accent bar -->
  <rect x="0" y="0" width="8" height="630" fill="url(#tealGrad)"/>

  <!-- Badge pill -->
  <rect x="80" y="72" width="234" height="38" rx="19" fill="rgba(0,188,212,0.15)" stroke="#00bcd4" stroke-width="1.5"/>
  <text x="197" y="97" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#00bcd4" text-anchor="middle" letter-spacing="2.5">PAID SERVICE · $350</text>

  <!-- Headline -->
  <text x="80" y="196" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="white">Professional Website</text>
  <text x="80" y="268" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="#00bcd4">Audit + Fix Kit</text>

  <!-- Subheadline -->
  <text x="80" y="324" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.65)">28-point technical review across 8 categories.</text>
  <text x="80" y="356" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.65)">Delivered within 24 hours.</text>

  <!-- Checklist rows -->
  <rect x="80" y="404" width="20" height="20" rx="10" fill="rgba(0,188,212,0.25)"/>
  <text x="90" y="419" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#00bcd4" text-anchor="middle">&#x2713;</text>
  <text x="114" y="419" font-family="Arial, sans-serif" font-size="19" fill="rgba(255,255,255,0.82)">SEO · Performance · Schema · Security</text>

  <rect x="80" y="444" width="20" height="20" rx="10" fill="rgba(0,188,212,0.25)"/>
  <text x="90" y="459" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#00bcd4" text-anchor="middle">&#x2713;</text>
  <text x="114" y="459" font-family="Arial, sans-serif" font-size="19" fill="rgba(255,255,255,0.82)">Analytics · Accessibility · AI Discoverability</text>

  <rect x="80" y="484" width="20" height="20" rx="10" fill="rgba(0,188,212,0.25)"/>
  <text x="90" y="499" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#00bcd4" text-anchor="middle">&#x2713;</text>
  <text x="114" y="499" font-family="Arial, sans-serif" font-size="19" fill="rgba(255,255,255,0.82)">Social &amp; Open Graph</text>

  <!-- Divider line -->
  <line x1="80" y1="560" x2="1120" y2="560" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

  <!-- Brand wordmark -->
  <text x="1120" y="596" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="rgba(255,255,255,0.45)" text-anchor="end">Sequel Web Studio</text>
  <text x="80" y="596" font-family="Arial, sans-serif" font-size="17" fill="rgba(255,255,255,0.3)">sequelwebstudio.com</text>
</svg>`;

const outputDir = join(__dirname, '..', 'public', 'images');
mkdirSync(outputDir, { recursive: true });

const outputPath = join(outputDir, 'audit-og.png');

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png()
  .toFile(outputPath);

console.log('Generated public/images/audit-og.png (1200x630)');
