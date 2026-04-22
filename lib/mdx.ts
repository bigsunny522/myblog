import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
  content: string;
  published?: boolean;
}

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

export function getMdxOnlySlugs(): string[] {
  return getMdxPostSlugs().map((s) => s.replace(/\.mdx$/, '')).filter(Boolean);
}

export async function getPostSlugs(): Promise<string[]> {
  return getMdxOnlySlugs();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return getMdxPostBySlug(slug);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  return getMdxPostSlugs()
    .map((slug) => getMdxPostBySlug(slug))
    .filter((post): post is BlogPost => post !== undefined && post.published !== false)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

