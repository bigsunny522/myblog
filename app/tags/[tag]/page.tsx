import React from 'react';
import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/utils';
import { getAllPosts } from '@/lib/mdx';
import { BlogList } from '@/components/BlogList';
import { notFound } from 'next/navigation';

interface TagPageProps {
  params: {
    tag: string;
  };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  const siteImage = `${getBaseUrl()}/images/main/skyblue.png`;

  return {
    title: `Posts tagged with #${decodedTag}`,
    description: `Articles tagged with #${decodedTag}`,
    openGraph: {
      title: `#${decodedTag} | ざっくらぼ`,
      description: `Articles tagged with #${decodedTag}`,
      url: `/tags/${tag}`,
      siteName: 'ざっくらぼ',
      type: 'website',
      images: [{ url: siteImage, width: 1200, height: 630, alt: 'ざっくらぼ' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `#${decodedTag} | ざっくらぼ`,
      description: `Articles tagged with #${decodedTag}`,
      images: [siteImage],
    },
  };
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.tags?.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).map((tag) => ({ tag }));
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = (await getAllPosts()).filter((post) => post.tags?.includes(decodedTag));

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold font-outfit text-foreground">
          <span className="text-primary">#{decodedTag}</span> の記事一覧
        </h1>
        <p className="text-muted-foreground">
          {posts.length}件の記事
        </p>
      </div>

      <BlogList posts={posts} />
    </div>
  );
}
