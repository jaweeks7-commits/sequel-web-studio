import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

// SVG source — matches the inline favicon in BaseLayout.astro
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#1F3864"/>
  <text x="50%" y="58%" text-anchor="middle" font-family="Georgia,serif" font-size="38" font-weight="700" fill="white">S</text>
</svg>`;

const svgBuffer = Buffer.from(svg);

const sizes = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const { file, size } of sizes) {
  const outPath = join(PUBLIC, file);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`Generated: public/${file} (${size}×${size})`);
}

// site.webmanifest
const manifest = {
  name: 'Sequel Web Studio',
  short_name: 'Sequel',
  icons: [
    { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
  theme_color: '#1F3864',
  background_color: '#F7F8FA',
  display: 'standalone',
};
writeFileSync(join(PUBLIC, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
console.log('Generated: public/site.webmanifest');
