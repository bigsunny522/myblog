/**
 * Notion → MDX 変換スクリプト
 *
 * Notionデータベースにある記事をMDXファイルとして content/posts/ に保存します。
 *
 * Usage:
 *   node --env-file=.env.local scripts/notion-to-mdx.mjs
 *   node --env-file=.env.local scripts/notion-to-mdx.mjs --force  # 既存ファイルを上書き
 */

import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '../content/posts');
const IMAGES_DIR = path.join(__dirname, '../public/images/posts');
const FORCE = process.argv.includes('--force');

const IMAGE_FILENAME_RE = /^[\w][\w\- ]*\.(jpg|jpeg|png|gif|webp|avif|svg)$/i;

// ── image helpers ────────────────────────────────────────────────────────────

function loadManifest(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, '_manifest.json'), 'utf-8'));
  } catch {
    return {};
  }
}

function saveManifest(dir, manifest) {
  fs.writeFileSync(path.join(dir, '_manifest.json'), JSON.stringify(manifest, null, 2));
}

async function downloadImage(url, filename, slug) {
  const dir = path.join(IMAGES_DIR, slug);
  fs.mkdirSync(dir, { recursive: true });
  const localPath = path.join(dir, filename);
  const baseUrl = url.split('?')[0];
  const manifest = loadManifest(dir);

  if (fs.existsSync(localPath) && manifest[filename] === baseUrl) {
    return `/images/posts/${slug}/${filename}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image download failed: ${response.status} ${url}`);

  fs.writeFileSync(localPath, Buffer.from(await response.arrayBuffer()));
  manifest[filename] = baseUrl;
  saveManifest(dir, manifest);
  return `/images/posts/${slug}/${filename}`;
}

function resolveImageFilename(caption, url) {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
  const trimmed = caption.trim();
  if (trimmed) {
    if (IMAGE_FILENAME_RE.test(trimmed)) return trimmed;
    const safe = trimmed.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').replace(/\s+/g, '-').slice(0, 64);
    if (safe) return `${safe}.${ext}`;
  }
  return `${crypto.createHash('sha256').update(url.split('?')[0]).digest('hex').slice(0, 16)}.${ext}`;
}

async function localizeMarkdownImages(markdown, slug) {
  const replacements = [];
  for (const match of markdown.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g)) {
    const [original, alt, url] = match;
    try {
      const altForFilename = alt.replace(/\|(small|medium|large|\d+(?:\.\d+)?%)$/i, '').trim();
      const filename = resolveImageFilename(altForFilename, url);
      const localPath = await downloadImage(url, filename, slug);
      const sizeHint = (alt.match(/(\|(small|medium|large|\d+(?:\.\d+)?%))$/i) || [])[1] || '';
      const baseAlt = IMAGE_FILENAME_RE.test(altForFilename) ? '' : altForFilename;
      replacements.push({ original, replacement: `![${baseAlt + sizeHint}](${localPath})` });
    } catch {
      // keep original URL
    }
  }
  let result = markdown;
  for (const { original, replacement } of replacements) result = result.replace(original, replacement);
  return result;
}

// ── Notion rich-text helpers ─────────────────────────────────────────────────

const BG_COLOR_MAP = {
  blue_background: '#7babff', yellow_background: '#ffd600', green_background: '#4ade80',
  red_background: '#f87171', purple_background: '#c084fc', pink_background: '#f472b6',
  gray_background: '#9ca3af', orange_background: '#fb923c',
};
const TEXT_COLOR_MAP = {
  blue: '#7babff', green: '#4ade80', red: '#f87171', purple: '#c084fc',
  pink: '#f472b6', gray: '#9ca3af', orange: '#fb923c', yellow: '#ffd600', brown: '#92400e',
};

function getPlainText(richText) {
  return (richText || []).map((t) => t.plain_text).join('');
}

function getCoverUrl(cover) {
  if (!cover) return null;
  if (cover.type === 'external') return cover.external?.url ?? null;
  if (cover.type === 'file') return cover.file?.url ?? null;
  return null;
}

function richTextToMarkdown(richText) {
  return (richText || []).map((t) => {
    let s = t.plain_text;
    if (!s) return '';
    if (t.annotations?.code) s = `\`${s}\``;
    if (t.annotations?.bold) s = `**${s}**`;
    if (t.annotations?.italic) s = `*${s}*`;
    if (t.annotations?.strikethrough) s = `~~${s}~~`;
    if (t.annotations?.underline) s = `<u>${s}</u>`;
    if (t.href) s = `[${s}](${t.href})`;
    const color = t.annotations?.color ?? 'default';
    if (color !== 'default') {
      if (BG_COLOR_MAP[color]) s = `<Text bg="${BG_COLOR_MAP[color]}">${s}</Text>`;
      else if (TEXT_COLOR_MAP[color]) s = `<Text color="${TEXT_COLOR_MAP[color]}">${s}</Text>`;
    }
    return s;
  }).join('');
}

function getPointNumber(emoji) {
  if (/^\d$/.test(emoji)) return parseInt(emoji, 10);
  const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  const idx = numberEmojis.indexOf(emoji);
  return idx !== -1 ? idx + 1 : null;
}

// ── Notion block → Markdown ──────────────────────────────────────────────────

async function tableToMarkdown(notion, block) {
  const tableWidth = block.table?.table_width ?? 0;
  const hasRowHeader = block.table?.has_row_header ?? false;
  const response = await notion.blocks.children.list({ block_id: block.id, page_size: 100 });
  const rows = response.results.filter((r) => r.type === 'table_row');

  if (tableWidth === 2) {
    const dataRows = hasRowHeader ? rows.slice(1) : rows;
    const items = dataRows.map((r) => {
      const cells = r.table_row.cells;
      const label = richTextToMarkdown(cells[0] || []).replace(/"/g, '&quot;');
      const value = richTextToMarkdown(cells[1] || []);
      return `<SpecsItem label="${label}">${value}</SpecsItem>`;
    });
    return `<Specs>\n${items.join('\n')}\n</Specs>\n\n`;
  }

  const mdRows = rows.map((r) => {
    const cells = r.table_row.cells.map((cell) => richTextToMarkdown(cell));
    return `| ${cells.join(' | ')} |`;
  });
  if (mdRows.length > 0) {
    const separator = `| ${Array(tableWidth).fill('---').join(' | ')} |`;
    mdRows.splice(hasRowHeader ? 1 : 0, 0, separator);
  }
  return mdRows.join('\n') + '\n\n';
}

async function blockToMarkdown(notion, block, slug, depth) {
  const indent = '  '.repeat(depth);
  const type = block.type;
  const data = block[type];

  if (type === 'table') return tableToMarkdown(notion, block);

  if (type === 'column_list') {
    const colsResponse = await notion.blocks.children.list({ block_id: block.id, page_size: 100 });
    const columnMds = await Promise.all(
      colsResponse.results.map((col) => blocksToMarkdown(notion, col.id, slug, 0))
    );
    const count = columnMds.length;
    const cols = columnMds.map((md) => `<div>\n\n${md}\n</div>`).join('\n');
    return `<ImageGrid columns={${count}}>\n${cols}\n</ImageGrid>\n\n`;
  }

  const text = data?.rich_text ? richTextToMarkdown(data.rich_text) : '';
  let children = '';
  if (block.has_children) {
    children = await blocksToMarkdown(notion, block.id, slug, depth + 1);
  }

  switch (type) {
    case 'paragraph': return `${indent}${text}\n\n${children}`;
    case 'heading_1': return `# ${text}\n\n${children}`;
    case 'heading_2': return `## ${text}\n\n${children}`;
    case 'heading_3': return `### ${text}\n\n${children}`;
    case 'heading_4': return `#### ${text}\n\n${children}`;
    case 'bulleted_list_item': return `${indent}- ${text}\n${children}`;
    case 'numbered_list_item': return `${indent}1. ${text}\n${children}`;
    case 'to_do': return `${indent}- [${data.checked ? 'x' : ' '}] ${text}\n${children}`;
    case 'toggle': return `${indent}${text}\n\n${children}`;
    case 'quote': return text;
    case 'callout': {
      const emoji = data.icon?.emoji ?? '';
      const pointNum = getPointNumber(emoji);
      if (pointNum !== null) {
        const title = getPlainText(data.rich_text).replace(/"/g, '&quot;');
        return `<FeaturePoint number={${pointNum}} title="${title}">\n\n${children}\n\n</FeaturePoint>\n\n`;
      }
      const emojiPrefix = emoji ? `${emoji} ` : '';
      return `<CouponBox>\n\n${emojiPrefix}${text}\n\n${children}\n</CouponBox>\n\n`;
    }
    case 'divider': return `---\n\n`;
    case 'code': return `\`\`\`${data.language || ''}\n${getPlainText(data.rich_text)}\n\`\`\`\n\n`;
    case 'image': {
      const url = getCoverUrl(data);
      if (!url) return '';
      const caption = getPlainText(data.caption);
      return `![${caption}](${url})\n\n`;
    }
    default: return text ? `${text}\n\n` : '';
  }
}

async function blocksToMarkdown(notion, blockId, slug, depth = 0) {
  const allBlocks = [];
  let cursor = undefined;
  do {
    const response = await notion.blocks.children.list({
      block_id: blockId, start_cursor: cursor, page_size: 100,
    });
    allBlocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  const chunks = [];
  let reviewSection = null;
  let goodItems = [];
  let pendingItems = [];
  let buyLinksSection = false;
  let buyLinks = [];
  let buyLinksImage = undefined;
  let buyLinksTitle = undefined;
  let buyLinksDescription = undefined;
  let quoteLines = [];

  const flushQuote = () => {
    if (!quoteLines.length) return;
    chunks.push(`<CouponBox>\n\n${quoteLines.join('\n\n')}\n\n</CouponBox>\n\n`);
    quoteLines = [];
  };

  const flushBuyLinks = () => {
    if (buyLinks.length > 0) {
      const attrs = [];
      if (buyLinksImage) attrs.push(`image="${buyLinksImage}"`);
      if (buyLinksTitle) attrs.push(`title="${buyLinksTitle.replace(/"/g, '&quot;')}"`);
      if (buyLinksDescription) attrs.push(`description="${buyLinksDescription.replace(/"/g, '&quot;')}"`);
      const attrsStr = attrs.length ? ' ' + attrs.join(' ') : '';
      const items = buyLinks.map(({ type, href, label }) =>
        `<BuyLink type="${type}" href="${href}">${label}</BuyLink>`
      ).join('\n');
      chunks.push(`<BuyLinks${attrsStr}>\n${items}\n</BuyLinks>\n\n`);
    }
    buyLinks = []; buyLinksImage = undefined; buyLinksTitle = undefined;
    buyLinksDescription = undefined; buyLinksSection = false;
  };

  const renderReviewItems = (items, type) =>
    items.map(({ title, description }) =>
      `<ReviewPoint type="${type}" title="${title.replace(/"/g, '&quot;')}">${description}</ReviewPoint>`
    ).join('\n');

  const flushReview = () => {
    if (!reviewSection) return;
    if (reviewSection === 'good' && pendingItems.length) {
      chunks.push(`<ReviewPoints type="good">\n${renderReviewItems(pendingItems, 'good')}\n</ReviewPoints>\n\n`);
    } else if (reviewSection === 'con') {
      chunks.push(
        `<ReviewSummary>\n` +
        `<ReviewPoints type="good">\n${renderReviewItems(goodItems, 'good')}\n</ReviewPoints>\n` +
        `<ReviewPoints type="con">\n${renderReviewItems(pendingItems, 'con')}\n</ReviewPoints>\n` +
        `</ReviewSummary>\n\n`
      );
    }
    reviewSection = null; goodItems = []; pendingItems = [];
  };

  for (const block of allBlocks) {
    const type = block.type;
    const plainText = block[type]?.rich_text ? getPlainText(block[type].rich_text) : '';

    if (type === 'quote') {
      quoteLines.push(richTextToMarkdown(block.quote.rich_text));
      continue;
    }

    flushQuote();

    if (type === 'heading_3') {
      flushBuyLinks();
      if (plainText === 'GOOD') { flushReview(); reviewSection = 'good'; continue; }
      else if (plainText === '気になる点' && reviewSection === 'good') {
        goodItems = [...pendingItems]; pendingItems = []; reviewSection = 'con'; continue;
      } else if (plainText === '購入リンク') { flushReview(); buyLinksSection = true; continue; }
      else { flushReview(); }
    }

    if (buyLinksSection && type === 'image') {
      const url = getCoverUrl(block.image);
      if (url && !buyLinksImage) {
        try {
          const caption = getPlainText(block.image?.caption || []);
          const filename = resolveImageFilename(caption, url);
          buyLinksImage = await downloadImage(url, filename, slug);
        } catch { buyLinksImage = url; }
      }
      continue;
    }

    if (buyLinksSection && type === 'paragraph' && buyLinks.length === 0) {
      const text = getPlainText(block.paragraph.rich_text);
      if (text) {
        if (!buyLinksTitle) buyLinksTitle = text;
        else if (!buyLinksDescription) buyLinksDescription = text;
      }
      continue;
    }

    if (buyLinksSection && type === 'bulleted_list_item') {
      const richText = block.bulleted_list_item.rich_text;
      const href = richText.find((t) => t.href)?.href || '';
      const label = getPlainText(richText);
      if (href) {
        let linkType = 'official';
        if (/amazon|amzn/i.test(href)) linkType = 'amazon';
        else if (/rakuten/i.test(href)) linkType = 'rakuten';
        buyLinks.push({ type: linkType, href, label });
        continue;
      }
      flushBuyLinks();
    } else if (buyLinksSection && type !== 'bulleted_list_item') {
      flushBuyLinks();
    }

    if (reviewSection && type === 'bulleted_list_item') {
      const text = richTextToMarkdown(block.bulleted_list_item.rich_text);
      const match = text.match(/^\*\*(.+?)\*\*\s*[—\-]\s*(.+)$/);
      if (match) { pendingItems.push({ title: match[1], description: match[2] }); continue; }
      flushReview();
    } else if (reviewSection && type !== 'bulleted_list_item') {
      flushReview();
    }

    const md = await blockToMarkdown(notion, block, slug, depth);
    if (md) chunks.push(md);
  }

  flushQuote(); flushBuyLinks(); flushReview();
  return chunks.join('');
}

// ── Page metadata → frontmatter ──────────────────────────────────────────────

function findPropByType(props, type) {
  return Object.values(props).find((p) => p?.type === type);
}

function getProp(props, name, type) {
  return props[name] ?? findPropByType(props, type);
}

function buildFrontmatter(post) {
  const lines = ['---'];
  lines.push(`title: "${post.title.replace(/"/g, '\\"')}"`);
  if (post.subtitle) lines.push(`subtitle: "${post.subtitle.replace(/"/g, '\\"')}"`);
  lines.push(`excerpt: "${post.excerpt.replace(/"/g, '\\"')}"`);
  lines.push(`date: "${post.date}"`);
  lines.push(`category: "${post.category}"`);
  lines.push(`published: ${post.published}`);
  lines.push(`recommended: ${post.recommended}`);
  const tags = post.tags.map((t) => `"${t}"`).join(', ');
  lines.push(`tags: [${tags}]`);
  lines.push(`coverImage: "${post.coverImage}"`);
  lines.push('---');
  return lines.join('\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !dbId) {
    console.error('ERROR: NOTION_API_KEY / NOTION_DATABASE_ID が設定されていません。');
    console.error('Usage: node --env-file=.env.local scripts/notion-to-mdx.mjs');
    process.exit(1);
  }

  const notion = new Client({ auth: apiKey });
  fs.mkdirSync(POSTS_DIR, { recursive: true });

  // Fetch all pages
  console.log('Notionデータベースを取得中...');
  const allPages = [];
  let cursor = undefined;
  do {
    const response = await notion.databases.query({
      database_id: dbId, start_cursor: cursor, page_size: 100,
    });
    allPages.push(...response.results);
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  console.log(`${allPages.length}件のページを発見しました\n`);

  let created = 0, skipped = 0, errored = 0;

  for (const page of allPages) {
    const props = page.properties;
    const slug = getPlainText(getProp(props, 'Slug', 'rich_text')?.rich_text);
    if (!slug) { console.warn(`  [skip] slug なし: ${page.id}`); skipped++; continue; }

    const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`);
    if (fs.existsSync(mdxPath) && !FORCE) {
      console.log(`  [skip] ${slug}.mdx は既に存在します (--force で上書き)`);
      skipped++;
      continue;
    }

    console.log(`  [変換中] ${slug}`);

    try {
      // Build metadata
      const titleProp = findPropByType(props, 'title');
      const title = getPlainText(titleProp?.title) || slug;
      const subtitle = getPlainText(getProp(props, 'Subtitle', 'rich_text')?.rich_text);
      const excerpt = getPlainText(getProp(props, 'Excerpt', 'rich_text')?.rich_text);
      const date = (getProp(props, 'Date', 'date')?.date)?.start || '';
      const category = (getProp(props, 'Category', 'select')?.select)?.name || '';
      const tags = ((getProp(props, 'Tags', 'multi_select')?.multi_select) || []).map((t) => t.name);
      const recommended = (getProp(props, 'Recommended', 'checkbox')?.checkbox) || false;
      const published = (getProp(props, 'Published', 'checkbox')?.checkbox) ?? false;

      // Cover image
      let coverImage = '/images/main/skyblue.png';
      const coverUrl = getCoverUrl(page.cover);
      if (coverUrl) {
        try {
          const ext = coverUrl.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
          coverImage = await downloadImage(coverUrl, `cover.${ext}`, slug);
        } catch { coverImage = coverUrl; }
      }

      // Content
      let rawMarkdown = await blocksToMarkdown(notion, page.id, slug);
      const content = await localizeMarkdownImages(rawMarkdown, slug);

      // Write MDX
      const frontmatter = buildFrontmatter({
        title, subtitle, excerpt, date, category, tags, coverImage, recommended, published,
      });
      fs.writeFileSync(mdxPath, `${frontmatter}\n\n${content.trimEnd()}\n`, 'utf-8');
      console.log(`  [完了] content/posts/${slug}.mdx`);
      created++;
    } catch (err) {
      console.error(`  [エラー] ${slug}: ${err.message}`);
      errored++;
    }
  }

  console.log(`\n--- 完了 ---`);
  console.log(`作成: ${created}件 / スキップ: ${skipped}件 / エラー: ${errored}件`);
}

main().catch((err) => { console.error(err); process.exit(1); });
