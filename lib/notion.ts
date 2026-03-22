import { Client } from '@notionhq/client';
import type { BlogPost } from './mdx';
import fs from 'fs';
import path from 'path';

const IMAGE_DIR = path.join(process.cwd(), 'public/images/notion');

function ensureImageDir() {
  if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
  }
}

async function downloadImage(url: string, filename: string): Promise<string> {
  ensureImageDir();
  const localPath = path.join(IMAGE_DIR, filename);

  if (fs.existsSync(localPath)) {
    return `/images/notion/${filename}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(localPath, Buffer.from(buffer));
  return `/images/notion/${filename}`;
}

async function localizeMarkdownImages(markdown: string, prefix: string): Promise<string> {
  const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const replacements: { original: string; replacement: string }[] = [];

  for (const match of markdown.matchAll(imgRegex)) {
    const [original, alt, url] = match;
    try {
      const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
      const hash = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      const filename = `${prefix}-${hash}.${ext}`;
      const localPath = await downloadImage(url, filename);
      replacements.push({ original, replacement: `![${alt}](${localPath})` });
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
      return s;
    })
    .join('');
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
async function blockToMarkdown(notion: Client, block: any, depth: number): Promise<string> {
  const indent = '  '.repeat(depth);
  const type: string = block.type;
  const data = block[type];

  // Table is handled separately to access all rows at once
  if (type === 'table') return tableToMarkdown(notion, block);

  const text = data?.rich_text ? richTextToMarkdown(data.rich_text) : '';

  let children = '';
  if (block.has_children) {
    children = await blocksToMarkdown(notion, block.id, depth + 1);
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
      const emoji = data.icon?.emoji ? `${data.icon.emoji} ` : '';
      return `> ${emoji}${text}\n\n${children}`;
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
async function blocksToMarkdown(notion: Client, blockId: string, depth = 0): Promise<string> {
  const chunks: string[] = [];
  let cursor: string | undefined = undefined;

  do {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of response.results) {
      const md = await blockToMarkdown(notion, block, depth);
      if (md) chunks.push(md);
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return chunks.join('');
}

// Module-level cache
let metadataCache: { post: BlogPost; pageId: string }[] | null = null;

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
      coverImage = await downloadImage(coverUrl, `${slug}-cover.${ext}`);
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
  const notion = createClient();
  const pages = await fetchAllPages(notion);
  const results = await Promise.all(pages.map(pageToMetadata));
  metadataCache = results
    .filter((r): r is { post: BlogPost; pageId: string } => r !== null)
    .sort((a, b) => (a.post.date > b.post.date ? -1 : 1));
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

  await getAllNotionPosts();
  const cached = metadataCache?.find((c) => c.post.slug === slug);
  if (!cached) return undefined;

  const notion = createClient();
  const rawMarkdown = await blocksToMarkdown(notion, cached.pageId);
  const content = await localizeMarkdownImages(rawMarkdown, slug);

  return { ...cached.post, content };
}
