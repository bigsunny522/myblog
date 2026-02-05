import React from 'react';
import type { Metadata } from 'next';
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
import { BudouxText } from '@/components/ui/BudouxText';
import { ViewCounter } from '@/components/ViewCounter';
import { ShareMenu } from '@/components/ShareMenu';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const ogImage = post.coverImage || '/images/main/logo.svg';
  const description = post.excerpt || `Read more about ${post.title}`;

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      url: `/blog/${slug}`,
      type: 'article',
      images: [
        {
          url: ogImage,
          alt: post.title,
        },
      ],
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: [ogImage],
    },
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
      {/* Hero Header */}
      <div className="container mx-auto px-4 pt-8 md:pt-12 pb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          {/* Cover Image */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 border border-border/50 shadow-sm">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Metadata */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20">
                {post.category}
              </span>
              <div className="flex items-center text-muted-foreground text-sm">
                <time>{post.date}</time>
                <span className="mx-2">•</span>
                <span>5 min read</span>
                <span className="mx-2">•</span>
                <ViewCounter slug={slug} />
                <span className="mx-2">•</span>
                <ShareMenu title={post.title} slug={slug} />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-outfit text-foreground tracking-tight leading-tight">
              <BudouxText>{post.title}</BudouxText>
            </h1>

            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag) => (
                <Link 
                  key={tag} 
                  href={`/tags/${tag}`}
                  className="px-2 py-1 bg-secondary hover:bg-secondary/80 text-xs rounded-md transition-colors text-secondary-foreground"
                >
                  #{tag}
                </Link>
              ))}
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
        
        <div className="relative my-20 pt-10 pb-12 px-6 rounded-3xl border border-border/50 bg-gradient-to-b from-secondary/20 to-background">
          {/* Decorative background pattern (Clipped) */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold font-outfit tracking-tight">
                Thanks for reading!
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                この記事が面白かったら、ぜひSNSでシェアしてください。<br />
                感想やコメントもお待ちしています 
              </p>
            </div>
            
            <ShareMenu 
              title={post.title} 
              slug={slug} 
              label="Share this post" 
              variant="primary"
              popupPosition="top"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
