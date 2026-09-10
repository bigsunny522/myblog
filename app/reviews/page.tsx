import React from 'react';
import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/utils';
import { getAllPosts } from '@/lib/mdx';
import { FilteredBlogList, type TagGroup } from '@/components/FilteredBlogList';
import taxonomy from '@/content/data/taxonomy.json';

const siteImage = `${getBaseUrl()}/images/main/skyblue.png`;

export const metadata: Metadata = {
  alternates: { canonical: '/reviews' },
  title: '記事一覧',
  description: '最新のガジェットレビューとニュース一覧',
  openGraph: {
    title: '記事一覧 | ざっくらぼ',
    description: '最新のガジェットレビューとニュース一覧',
    url: '/reviews',
    siteName: 'ざっくらぼ',
    type: 'website',
    images: [{ url: siteImage, width: 1200, height: 630, alt: 'ざっくらぼ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '記事一覧 | ざっくらぼ',
    description: '最新のガジェットレビューとニュース一覧',
    images: [siteImage],
  },
};

export default async function ReviewsPage() {
  const posts = await getAllPosts();

  const usedTags = new Set(posts.flatMap((post) => post.tags ?? []).filter(Boolean));
  const groups: TagGroup[] = Object.entries(taxonomy.tagGroups).map(([label, tags]) => ({
    label,
    tags: tags.filter((tag) => usedTags.has(tag)),
  }));
  const groupedTags = new Set(groups.flatMap((group) => group.tags));
  const otherTags = [...usedTags].filter((tag) => !groupedTags.has(tag));
  if (otherTags.length > 0) {
    groups.push({ label: 'その他', tags: otherTags });
  }
  const tagGroups = groups.filter((group) => group.tags.length > 0);

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold font-outfit text-foreground tracking-tight">
          記事一覧
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          最新のレビュー、ガジェットニュース、技術解説をご覧いただけます。
        </p>
      </div>

      <FilteredBlogList posts={posts} tagGroups={tagGroups} />
    </div>
  );
}
