import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const DIRS = [
  join(ROOT, 'public', 'images', 'Portfolio'),
  join(ROOT, 'public', 'images', 'sample-deliverables'),
];

const WEBP_QUALITY = 82;

let totalBefore = 0;
let totalAfter = 0;

for (const dir of DIRS) {
  const files = readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  for (const file of files) {
    const inPath = join(dir, file);
    const outPath = join(dir, basename(file, extname(file)) + '.webp');
    const before = statSync(inPath).size;
    await sharp(inPath).webp({ quality: WEBP_QUALITY }).toFile(outPath);
    const after = statSync(outPath).size;
    const saving = Math.round((1 - after / before) * 100);
    totalBefore += before;
    totalAfter += after;
    const rel = inPath.replace(ROOT + '\\', '').replace(ROOT + '/', '');
    console.log(`${rel} → .webp  ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB  (−${saving}%)`);
  }
}

const totalSaving = Math.round((1 - totalAfter / totalBefore) * 100);
console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(1)} MB  (−${totalSaving}%)`);
console.log('Original files kept as fallbacks.');
