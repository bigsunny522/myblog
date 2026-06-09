/**
 * Repurposes pre-committed WEBPs in public/images/{subfolder}/nextImageExportOptimizer/
 * into the location where next-image-export-optimizer looks for cached files:
 *   out/nextImageExportOptimizer/{subfolder}/{filename}.WEBP
 *
 * Without this, the optimizer regenerates all 800+ WEBPs on every CI build.
 * With this, it finds them already present and skips regeneration.
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join } from 'path';

const outImagesDir = 'out/images';
const cacheTarget = 'out/nextImageExportOptimizer';

let copied = 0;
let skipped = 0;

function scanDir(dir, relPath) {
  if (!existsSync(dir)) return;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    if (entry.name === 'nextImageExportOptimizer') {
      const srcDir = join(dir, 'nextImageExportOptimizer');
      const destDir = join(cacheTarget, relPath);
      mkdirSync(destDir, { recursive: true });

      for (const file of readdirSync(srcDir)) {
        if (!file.endsWith('.WEBP') && !file.endsWith('.webp')) continue;
        const dest = join(destDir, file);
        if (existsSync(dest)) {
          skipped++;
        } else {
          copyFileSync(join(srcDir, file), dest);
          copied++;
        }
      }
    } else {
      const childRel = relPath ? `${relPath}/${entry.name}` : entry.name;
      scanDir(join(dir, entry.name), childRel);
    }
  }
}

scanDir(outImagesDir, '');
console.log(`setup-image-cache: ${copied} copied, ${skipped} already present`);
