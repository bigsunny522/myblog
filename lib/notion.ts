import { Client } from '@notionhq/client';
import type { BlogPost } from './mdx';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const POSTS_IMAGES_DIR = path.join(process.cwd(), 'public/images/posts');

// Valid image filename pattern (e.g. "main.jpg", "product-front.webp")
const IMAGE_FILENAME_RE = /^[\w][\w\- ]*\.(jpg|jpeg|png|gif|webp|avif|svg)$/i;

function loadManifest(dir: string): Record<string, string> {
  const manifestPath = path.join(dir, '_manifest.json');
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch {
    return {};
  }
}

function saveManifest(dir: string, manifest: Record<string, string>): void {
  fs.writeFileSync(path.join(dir, '_manifest.json'), JSON.stringify(manifest, null, 2));
}

async function downloadImage(url: string, filename: string, slug: string): Promise<string> {
  const dir = path.join(POSTS_IMAGES_DIR, slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const localPath = path.join(dir, filename);

  // Strip query params (signed URL expires) to get the stable base URL for comparison
  const baseUrl = url.split('?')[0];
  const manifest = loadManifest(dir);

  if (fs.existsSync(localPath) && manifest[filename] === baseUrl) {
    return `/images/posts/${slug}/${filename}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(localPath, Buffer.from(buffer));
  manifest[filename] = baseUrl;
  saveManifest(dir, manifest);
  return `/images/posts/${slug}/${filename}`;
}

// captionがあればサニタイズしてファイル名に使用、なければURLハッシュから生成
function resolveImageFilename(caption: string, url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
  const trimmed = caption.trim();
  if (trimmed) {
    // すでに拡張子付きファイル名形式ならそのまま使用
    if (IMAGE_FILENAME_RE.test(trimmed)) return trimmed;
    // それ以外はキャプション文字列をサニタイズして拡張子を付与
    const safeName = trimmed.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').replace(/\s+/g, '-').slice(0, 64);
    if (safeName) return `${safeName}.${ext}`;
  }
  const hash = crypto.createHash('sha256').update(url.split('?')[0]).digest('hex').slice(0, 16);
  return `${hash}.${ext}`;
}

async function localizeMarkdownImages(markdown: string, slug: string): Promise<string> {
  const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const replacements: { original: string; replacement: string }[] = [];

  for (const match of markdown.matchAll(imgRegex)) {
    const [original, alt, url] = match;
    try {
      const filename = resolveImageFilename(alt, url);
      const localPath = await downloadImage(url, filename, slug);
      // captionがファイル名として使われた場合はaltを空にする
      const newAlt = IMAGE_FILENAME_RE.test(alt.trim()) ? '' : alt;
      replacements.push({ original, replacement: `![${newAlt}](${localPath})` });
    } catch {
      // Keep original URL on failure
    }
  }

  let result = markdown;
  for (const { original, replacement } of replacements) {
    result = result.replace(original, replacement);
  }
  return result;
}

function getPlainText(richText: { plain_text: string }[] | undefined): string {
  return richText?.map((t) => t.plain_text).join('') || '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCoverUrl(cover: any): string | null {
  if (!cover) return null;
  if (cover.type === 'external') return cover.external?.url ?? null;
  if (cover.type === 'file') return cover.file?.url ?? null;
  return null;
}

// Map Notion annotation colors to CSS values for <Text> component
const BG_COLOR_MAP: Record<string, string> = {
  blue_background: '#7babff',
  yellow_background: '#ffd600',
  green_background: '#4ade80',
  red_background: '#f87171',
  purple_background: '#c084fc',
  pink_background: '#f472b6',
  gray_background: '#9ca3af',
  orange_background: '#fb923c',
};
const TEXT_COLOR_MAP: Record<string, string> = {
  blue: '#7babff', green: '#4ade80', red: '#f87171',
  purple: '#c084fc', pink: '#f472b6', gray: '#9ca3af',
  orange: '#fb923c', yellow: '#ffd600', brown: '#92400e',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richTextToMarkdown(richText: any[]): string {
  return richText
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((t: any) => {
      let s: string = t.plain_text;
      if (!s) return '';
      if (t.annotations?.code) s = `\`${s}\``;
      if (t.annotations?.bold) s = `**${s}**`;
      if (t.annotations?.italic) s = `*${s}*`;
      if (t.annotations?.strikethrough) s = `~~${s}~~`;
      if (t.annotations?.underline) s = `<u>${s}</u>`;
      if (t.href) s = `[${s}](${t.href})`;
      // Notion color annotations → <Text> component
      const color: string = t.annotations?.color ?? 'default';
      if (color !== 'default') {
        if (BG_COLOR_MAP[color]) s = `<Text bg="${BG_COLOR_MAP[color]}">${s}</Text>`;
        else if (TEXT_COLOR_MAP[color]) s = `<Text color="${TEXT_COLOR_MAP[color]}">${s}</Text>`;
      }
      return s;
    })
    .join('');
}

// Detect if an emoji string represents a digit (for FeaturePoint cards)
function getPointNumber(emoji: string): number | null {
  if (/^\d$/.test(emoji)) return parseInt(emoji, 10);
  const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  const idx = numberEmojis.indexOf(emoji);
  return idx !== -1 ? idx + 1 : null;
}

// Render a Notion table block.
// 2-column tables → <Specs><SpecsItem> JSX (picked up by MDXRemote)
// N-column tables → standard Markdown table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function tableToMarkdown(notion: Client, block: any): Promise<string> {
  const tableWidth: number = block.table?.table_width ?? 0;
  const hasRowHeader: boolean = block.table?.has_row_header ?? false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await notion.blocks.children.list({
    block_id: block.id,
    page_size: 100,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = response.results.filter((r: any) => r.type === 'table_row');

  if (tableWidth === 2) {
    // Skip header row if present (e.g. "項目 | 値" labels)
    const dataRows = hasRowHeader ? rows.slice(1) : rows;
    const items = dataRows.map((r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cells = r.table_row.cells as any[][];
      const label = richTextToMarkdown(cells[0] || []).replace(/"/g, '&quot;');
      const value = richTextToMarkdown(cells[1] || []);
      return `<SpecsItem label="${label}">${value}</SpecsItem>`;
    });
    return `<Specs>\n${items.join('\n')}\n</Specs>\n\n`;
  }

  // Standard markdown table
  const mdRows = rows.map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cells = (r.table_row.cells as any[][]).map((cell) => richTextToMarkdown(cell));
    return `| ${cells.join(' | ')} |`;
  });
  if (mdRows.length > 0) {
    const separator = `| ${Array(tableWidth).fill('---').join(' | ')} |`;
    mdRows.splice(hasRowHeader ? 1 : 0, 0, separator);
  }
  return mdRows.join('\n') + '\n\n';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function blockToMarkdown(notion: Client, block: any, slug: string, depth: number): Promise<string> {
  const indent = '  '.repeat(depth);
  const type: string = block.type;
  const data = block[type];

  // Table is handled separately to access all rows at once
  if (type === 'table') return tableToMarkdown(notion, block);

  // column_list: multi-column layout → <ImageGrid>
  if (type === 'column_list') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const colsResponse: any = await notion.blocks.children.list({ block_id: block.id, page_size: 100 });
    const columnMds: string[] = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      colsResponse.results.map((col: any) => blocksToMarkdown(notion, col.id, slug, 0))
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
    case 'paragraph':
      return `${indent}${text}\n\n${children}`;
    case 'heading_1':
      return `# ${text}\n\n${children}`;
    case 'heading_2':
      return `## ${text}\n\n${children}`;
    case 'heading_3':
      return `### ${text}\n\n${children}`;
    case 'heading_4':
      return `#### ${text}\n\n${children}`;
    case 'bulleted_list_item':
      return `${indent}- ${text}\n${children}`;
    case 'numbered_list_item':
      return `${indent}1. ${text}\n${children}`;
    case 'to_do':
      return `${indent}- [${data.checked ? 'x' : ' '}] ${text}\n${children}`;
    case 'toggle':
      return `${indent}${text}\n\n${children}`;
    case 'quote':
      return `${indent}> ${text}\n\n${children}`;
    case 'callout': {
      const emoji: string = data.icon?.emoji ?? '';
      const pointNum = getPointNumber(emoji);
      if (pointNum !== null) {
        // Number emoji → FeaturePoint card
        const title = getPlainText(data.rich_text).replace(/"/g, '&quot;');
        return `<FeaturePoint number={${pointNum}} title="${title}">\n\n${children}\n\n</FeaturePoint>\n\n`;
      }
      const emojiPrefix = emoji ? `${emoji} ` : '';
      return `> ${emojiPrefix}${text}\n\n${children}`;
    }
    case 'divider':
      return `---\n\n`;
    case 'code':
      return `\`\`\`${data.language || ''}\n${getPlainText(data.rich_text)}\n\`\`\`\n\n`;
    case 'image': {
      const url = getCoverUrl(data);
      if (!url) return '';
      const caption = getPlainText(data.caption);
      return `![${caption}](${url})\n\n`;
    }
    default:
      return text ? `${text}\n\n` : '';
  }
}

// Convert Notion blocks to Markdown
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function blocksToMarkdown(notion: Client, blockId: string, slug: string, depth = 0): Promise<string> {
  // Collect all blocks first to enable context-aware pattern detection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allBlocks: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    allBlocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  const chunks: string[] = [];
  let reviewSection: 'good' | 'con' | null = null;
  let goodItems: { title: string; description: string }[] = [];
  let pendingItems: { title: string; description: string }[] = [];
  let buyLinksSection = false;
  let buyLinks: { type: string; href: string; label: string }[] = [];
  let buyLinksImage: string | undefined = undefined;
  let buyLinksTitle: string | undefined = undefined;
  let buyLinksDescription: string | undefined = undefined;

  const flushBuyLinks = () => {
    if (buyLinks.length > 0) {
      const attrs: string[] = [];
      if (buyLinksImage) attrs.push(`image="${buyLinksImage}"`);
      if (buyLinksTitle) attrs.push(`title="${buyLinksTitle.replace(/"/g, '&quot;')}"`);
      if (buyLinksDescription) attrs.push(`description="${buyLinksDescription.replace(/"/g, '&quot;')}"`);
      const attrsStr = attrs.length ? ' ' + attrs.join(' ') : '';
      const items = buyLinks.map(({ type, href, label }) =>
        `<BuyLink type="${type}" href="${href}">${label}</BuyLink>`
      ).join('\n');
      chunks.push(`<BuyLinks${attrsStr}>\n${items}\n</BuyLinks>\n\n`);
    }
    buyLinks = [];
    buyLinksImage = undefined;
    buyLinksTitle = undefined;
    buyLinksDescription = undefined;
    buyLinksSection = false;
  };

  const renderReviewItems = (items: { title: string; description: string }[], type: 'good' | 'con') =>
    items.map(({ title, description }) =>
      `<ReviewPoint type="${type}" title="${title.replace(/"/g, '&quot;')}">${description}</ReviewPoint>`
    ).join('\n');

  const flushReview = () => {
    if (!reviewSection) return;
    if (reviewSection === 'good' && pendingItems.length) {
      chunks.push(`<ReviewPoints type="good">\n${renderReviewItems(pendingItems, 'good')}\n</ReviewPoints>\n\n`);
    } else if (reviewSection === 'con') {
      const goodMdx = renderReviewItems(goodItems, 'good');
      const conMdx = renderReviewItems(pendingItems, 'con');
      chunks.push(
        `<ReviewSummary>\n` +
        `<ReviewPoints type="good">\n${goodMdx}\n</ReviewPoints>\n` +
        `<ReviewPoints type="con">\n${conMdx}\n</ReviewPoints>\n` +
        `</ReviewSummary>\n\n`
      );
    }
    reviewSection = null;
    goodItems = [];
    pendingItems = [];
  };

  for (const block of allBlocks) {
    const type = block.type;
    const plainText = block[type]?.rich_text ? getPlainText(block[type].rich_text) : '';

    if (type === 'heading_3') {
      flushBuyLinks();
      if (plainText === 'GOOD') {
        flushReview();
        reviewSection = 'good';
        continue;
      } else if (plainText === '気になる点' && reviewSection === 'good') {
        goodItems = [...pendingItems];
        pendingItems = [];
        reviewSection = 'con';
        continue;
      } else if (plainText === '購入リンク') {
        flushReview();
        buyLinksSection = true;
        continue;
      } else {
        flushReview();
      }
    }

    if (buyLinksSection && type === 'image') {
      const url = getCoverUrl(block.image);
      if (url && !buyLinksImage) {
        try {
            const caption = getPlainText(block.image?.caption || []);
          const filename = resolveImageFilename(caption, url);
          buyLinksImage = await downloadImage(url, filename, slug);
        } catch {
          buyLinksImage = url;
        }
      }
      continue;
    }

    if (buyLinksSection && type === 'paragraph' && buyLinks.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const richText: any[] = block.paragraph.rich_text;
      const text = getPlainText(richText);
      if (text) {
        if (!buyLinksTitle) {
          buyLinksTitle = text;
        } else if (!buyLinksDescription) {
          buyLinksDescription = text;
        }
      }
      // Always continue (including empty paragraphs) to prevent premature flush
      continue;
    }

    if (buyLinksSection && type === 'bulleted_list_item') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const richText: any[] = block.bulleted_list_item.rich_text;
      const href = richText.find((t: any) => t.href)?.href || '';
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
      if (match) {
        pendingItems.push({ title: match[1], description: match[2] });
        continue;
      }
      flushReview();
    } else if (reviewSection && type !== 'bulleted_list_item') {
      flushReview();
    }

    const md = await blockToMarkdown(notion, block, slug, depth);
    if (md) chunks.push(md);
  }

  flushBuyLinks();
  flushReview();
  return chunks.join('');
}

// Module-level cache
let metadataCache: { post: BlogPost; pageId: string }[] | null = null;
let populateCachePromise: Promise<void> | null = null;

function createClient() {
  return new Client({ auth: process.env.NOTION_API_KEY });
}

// Find a property value by its Notion type (e.g. 'title', 'rich_text')
// This avoids depending on the user's exact property names
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findPropByType(props: Record<string, any>, type: string): any {
  return Object.values(props).find((p) => p?.type === type);
}

// Find a property value by name with fallback to type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProp(props: Record<string, any>, name: string, type: string): any {
  return props[name] ?? findPropByType(props, type);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function pageToMetadata(page: any): Promise<{ post: BlogPost; pageId: string } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = page.properties as Record<string, any>;

  const slug = getPlainText(getProp(props, 'Slug', 'rich_text')?.rich_text);
  if (!slug) return null;

  // Title: always find by type 'title' regardless of property name
  const titleProp = findPropByType(props, 'title');
  const title = getPlainText(titleProp?.title);

  let coverImage = '/images/main/skyblue.png';
  const coverUrl = getCoverUrl(page.cover);
  if (coverUrl) {
    try {
      const ext = coverUrl.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
      coverImage = await downloadImage(coverUrl, `cover.${ext}`, slug);
    } catch {
      // Keep default
    }
  }

  return {
    pageId: page.id as string,
    post: {
      slug,
      title,
      subtitle: getPlainText(getProp(props, 'Subtitle', 'rich_text')?.rich_text),
      excerpt: getPlainText(getProp(props, 'Excerpt', 'rich_text')?.rich_text),
      date: (getProp(props, 'Date', 'date')?.date as { start: string } | null)?.start || '',
      category: (getProp(props, 'Category', 'select')?.select as { name: string } | null)?.name || '',
      tags: ((getProp(props, 'Tags', 'multi_select')?.multi_select as { name: string }[]) || []).map((t) => t.name),
      coverImage,
      recommended: (getProp(props, 'Recommended', 'checkbox')?.checkbox as boolean) || false,
      published: (getProp(props, 'Published', 'checkbox')?.checkbox as boolean) ?? false,
      content: '',
    },
  };
}

async function fetchAllPages(notion: Client) {
  const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allPages: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    // Fetch ALL pages (published + unpublished) so unpublished drafts are
    // accessible via direct link but excluded from public listing
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: cursor,
      page_size: 100,
    });

    allPages.push(...response.results);
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return allPages;
}

async function populateCache(): Promise<void> {
  if (metadataCache) return;
  if (populateCachePromise) return populateCachePromise;
  populateCachePromise = (async () => {
    const notion = createClient();
    const pages = await fetchAllPages(notion);
    const results = await Promise.all(pages.map(pageToMetadata));
    metadataCache = results
      .filter((r): r is { post: BlogPost; pageId: string } => r !== null)
      .sort((a, b) => (a.post.date > b.post.date ? -1 : 1));
    populateCachePromise = null;
  })();
  return populateCachePromise;
}

// Returns only published posts (for listing pages)
export async function getAllNotionPosts(): Promise<BlogPost[]> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) return [];
  await populateCache();
  return metadataCache!.filter((c) => c.post.published).map((c) => c.post);
}

// Returns all slugs including unpublished (for generateStaticParams)
export async function getNotionPostSlugs(): Promise<string[]> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) return [];
  await populateCache();
  return metadataCache!.map((c) => c.post.slug);
}

export async function getNotionPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) return undefined;

  await populateCache();
  const cached = metadataCache?.find((c) => c.post.slug === slug);
  if (!cached) return undefined;

  const notion = createClient();
  const rawMarkdown = await blocksToMarkdown(notion, cached.pageId, slug);
  const content = await localizeMarkdownImages(rawMarkdown, slug);

  return { ...cached.post, content };
}
