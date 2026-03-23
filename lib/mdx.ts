import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  getAllNotionPosts,
  getNotionPostBySlug,
  getNotionPostSlugs,
} from './notion';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface BlogPost {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
  coverImage: string;
  recommended?: boolean;
  content: string; // MDX content
  published?: boolean;
}

function useNotion(): boolean {
  return !!(process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID);
}

// --- MDX file-based helpers (fallback) ---

function getMdxPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory);
}

function getMdxPostBySlug(slug: string): BlogPost | undefined {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);

  if (!fs.existsSync(fullPath)) return undefined;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    title: data.title,
    subtitle: data.subtitle,
    excerpt: data.excerpt,
    date: data.date,
    category: data.category,
    tags: data.tags || [],
    coverImage: data.coverImage,
    recommended: data.recommended || false,
    published: data.published !== false,
    content,
  };
}

function getAllMdxPosts(): BlogPost[] {
  return getMdxPostSlugs()
    .map((slug) => getMdxPostBySlug(slug))
    .filter((post): post is BlogPost => post !== undefined && post.published !== false)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

// --- Public async API ---
// When Notion is configured, Notion posts and MDX posts are merged.
// MDX slug takes precedence if both have the same slug.

export function getMdxOnlySlugs(): string[] {
  return getMdxPostSlugs().map((s) => s.replace(/\.mdx$/, '')).filter(Boolean);
}

export async function getPostSlugs(): Promise<string[]> {
  const mdxSlugs = getMdxPostSlugs()
    .map((s) => s.replace(/\.mdx$/, ''))
    .filter(Boolean);
  if (!useNotion()) return mdxSlugs;

  try {
    const notionSlugs = (await getNotionPostSlugs()).filter(Boolean);
    return Array.from(new Set([...notionSlugs, ...mdxSlugs]));
  } catch {
    return mdxSlugs;
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  // MDX takes precedence over Notion for the same slug
  const mdxPost = getMdxPostBySlug(slug);
  if (mdxPost) return mdxPost;
  if (useNotion()) return getNotionPostBySlug(slug);
  return undefined;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const mdxPosts = getAllMdxPosts();
  if (!useNotion()) return mdxPosts;

  const notionPosts = await getAllNotionPosts();
  const mdxSlugs = new Set(mdxPosts.map((p) => p.slug));

  // Merge: MDX posts override Notion posts with the same slug
  const merged = [
    ...mdxPosts,
    ...notionPosts.filter((p) => !mdxSlugs.has(p.slug)),
  ];
  return merged.sort((a, b) => (a.date > b.date ? -1 : 1));
}

