import React from 'react';
import type { Metadata } from 'next';
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
  
  return {
    title: `Posts tagged with #${decodedTag}`,
    description: `Articles tagged with #${decodedTag}`,
    openGraph: {
      title: `Posts tagged with #${decodedTag}`,
      description: `Articles tagged with #${decodedTag}`,
      url: `/tags/${tag}`,
    },
  };
}

export function generateStaticParams() {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.tags?.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).map((tag) => ({
    tag: tag,
  }));
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getAllPosts().filter((post) => post.tags?.includes(decodedTag));

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold font-outfit text-foreground">
          Posts tagged with <span className="text-primary">#{decodedTag}</span>
        </h1>
        <p className="text-muted-foreground">
          Found {posts.length} articles.
        </p>
      </div>

      <BlogList posts={posts} />
    </div>
  );
}
