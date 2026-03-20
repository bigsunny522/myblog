import React from 'react';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/mdx';
import { FilteredBlogList } from '@/components/FilteredBlogList';

export const metadata: Metadata = {
  title: '記事一覧',
  description: '最新のガジェットレビューとニュース一覧',
  openGraph: {
    title: '記事一覧 | ざっくらぼ',
    description: '最新のガジェットレビューとニュース一覧',
    url: '/reviews',
    siteName: 'ざっくらぼ',
    type: 'website',
    images: [{ url: '/images/main/skyblue.png', width: 1200, height: 630, alt: 'ざっくらぼ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '記事一覧 | ざっくらぼ',
    description: '最新のガジェットレビューとニュース一覧',
    images: ['/images/main/skyblue.png'],
  },
};

export default function ReviewsPage() {
  const posts = getAllPosts();
  
  // Extract all unique tags
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

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

      <FilteredBlogList posts={posts} allTags={allTags} />
    </div>
  );
}
