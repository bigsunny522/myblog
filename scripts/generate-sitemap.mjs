/**
 * Post-build script: generates out/sitemap.xml from MDX posts.
 * Run automatically via `npm run build`.
 *
 * Usage: node scripts/generate-sitemap.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://xyzack271.com').replace(/\/$/, '');
const postsDir = path.join(__dirname, '../content/posts');
const outDir = path.join(__dirname, '../out');

// Extract date from MDX frontmatter with a simple regex (no extra dependencies)
function getPostDate(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?/m);
  return match ? match[1] : new Date().toISOString().split('T')[0];
}

function getPublished(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^published:\s*(false)/m);
  return !match; // published unless explicitly false
}

function getMdxSlugs() {
  if (!fs.existsSync(postsDir)) return [];
  return fs.readdirSync(postsDir)
    .filter((f) => f.endsWith('.mdx'))
    .filter((f) => getPublished(path.join(postsDir, f)))
    .map((f) => f.replace(/\.mdx$/, ''));
}

const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { url: '', priority: '1.0', changefreq: 'daily', lastmod: today },
  { url: '/reviews', priority: '0.8', changefreq: 'weekly', lastmod: today },
  { url: '/gear', priority: '0.7', changefreq: 'monthly', lastmod: today },
  { url: '/about', priority: '0.5', changefreq: 'monthly', lastmod: today },
  { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly', lastmod: today },
];

// Gear items
const gearDir = path.join(__dirname, '../content/my-gear');
const gearSlugs = fs.existsSync(gearDir)
  ? fs.readdirSync(gearDir)
      .filter((f) => f.endsWith('.mdx'))
      .filter((f) => getPublished(path.join(gearDir, f)))
      .map((f) => f.replace(/\.mdx$/, ''))
  : [];

const slugs = getMdxSlugs();

const urlEntries = [
  ...staticPages.map(
    (p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ),
  ...slugs.map((slug) => {
    const date = getPostDate(path.join(postsDir, `${slug}.mdx`));
    return `  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }),
  ...gearSlugs.map((slug) => `  <url>
    <loc>${baseUrl}/gear/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;

if (!fs.existsSync(outDir)) {
  console.error('Error: out/ directory not found. Run `next build` first.');
  process.exit(1);
}

fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml, 'utf8');
console.log(`✓ sitemap.xml generated: ${staticPages.length} static + ${slugs.length} posts + ${gearSlugs.length} gear = ${urlEntries.length} URLs`);

// robots.txt を out/ へ動的生成（サイトマップ URL を正しいドメインで書き出す）
const robotsTxt = `User-agent: *
Allow: /
Disallow: /portfolio
Disallow: /dashboard

Sitemap: ${baseUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(outDir, 'robots.txt'), robotsTxt, 'utf8');
console.log(`✓ robots.txt generated: Sitemap → ${baseUrl}/sitemap.xml`);
