import React from 'react';
import remarkBreaks from 'remark-breaks';
import { getPostBySlug, getAllPosts } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/MDXComponents';
import rehypeSlug from 'rehype-slug';
import { TableOfContents } from '@/components/TableOfContents';
import GithubSlugger from 'github-slugger';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Extract headings using github-slugger to match rehype-slug IDs
  const slugger = new GithubSlugger();
  
  const headings = post.content
    .split('\n')
    .filter((line) => line.match(/^#{1,3}\s/))
    .map((line) => {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s/, '').replace(/\*\*/g, ''); // Simple cleanup
      
      const id = slugger.slug(text);
      
      return { id, text, level };
    });

  return (
    <article className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="space-y-4 max-w-4xl">
            <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold backdrop-blur-md border border-primary/20">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-outfit text-foreground tracking-tight shadow-black drop-shadow-sm">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-2 my-4">
              {post.tags?.map((tag) => (
                <Link 
                  key={tag} 
                  href={`/tags/${tag}`}
                  className="px-2 py-1 bg-secondary/80 hover:bg-secondary text-xs rounded-md transition-colors text-secondary-foreground"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <time>{post.date}</time>
              <span className="mx-2">•</span>
              <span>5 min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-3xl mt-12 prose prose-lg prose-gray dark:prose-invert">
        <TableOfContents headings={headings} />
        <MDXRemote 
          source={post.content} 
          components={mdxComponents}
          options={{
            mdxOptions: {
              rehypePlugins: [rehypeSlug],
              remarkPlugins: [remarkBreaks],
            },
          }} 
        />
      </div>
    </article>
  );
}
