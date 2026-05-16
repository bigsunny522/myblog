/**
 * Post-build script: submits all sitemap URLs to search engines via IndexNow.
 * IndexNow is supported by Bing, Yandex, Naver, Seznam, and others.
 * Run automatically via `npm run build` after generate-sitemap.mjs.
 *
 * Usage: node scripts/ping-indexnow.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://xyzack271.com').replace(/\/$/, '');
const INDEXNOW_KEY = '4b2e7a9f3c5d0182e6b8f4c1d3a07e59';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

const sitemapPath = path.join(__dirname, '../out/sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error('Error: out/sitemap.xml not found. Run generate-sitemap.mjs first.');
  process.exit(1);
}

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const urls = Array.from(sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g), (m) => m[1]);

if (urls.length === 0) {
  console.warn('⚠ No URLs found in sitemap. Skipping IndexNow ping.');
  process.exit(0);
}

const host = new URL(baseUrl).hostname;

const payload = {
  host,
  key: INDEXNOW_KEY,
  keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
  urlList: urls,
};

try {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (response.ok || response.status === 202) {
    console.log(`✓ IndexNow: ${urls.length} URLs submitted (status ${response.status})`);
  } else if (response.status === 422) {
    console.warn('⚠ IndexNow: URLs already submitted recently (422). No action needed.');
  } else {
    const body = await response.text().catch(() => '');
    console.warn(`⚠ IndexNow returned status ${response.status}: ${body}`);
  }
} catch (err) {
  // Network failure is non-fatal — sitemap is still valid for crawlers
  console.warn(`⚠ IndexNow ping failed (network): ${err.message}`);
}
