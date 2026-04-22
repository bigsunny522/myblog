import React from 'react';
import type { Metadata } from 'next';
import { getPostBySlug, getAllPosts, getPostSlugs, getMdxOnlySlugs } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/MDXComponents';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import { TableOfContents } from '@/components/TableOfContents';
import GithubSlugger from 'github-slugger';
import { BudouxText } from '@/components/ui/BudouxText';
import { ViewCounter } from '@/components/ViewCounter';
import { ShareMenu } from '@/components/ShareMenu';
import { getBaseUrl } from '@/lib/utils';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';
import { SafeImage } from '@/components/SafeImage';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

function calcReadingTime(content: string): number {
  let text = content;
  // コードブロック・インラインコードを除去
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]*`/g, '');
  // JSX/HTMLタグを除去
  text = text.replace(/<[^>]*>/g, '');
  // 画像記法を除去
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');
  // リンク記法はテキスト部分だけ残す
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  // 見出し・装飾記号を除去
  text = text.replace(/#{1,6}\s/g, '');
  text = text.replace(/[*_~>`|#-]/g, '');
  const charCount = text.replace(/\s+/g, '').length;
  return Math.max(1, Math.ceil(charCount / 700));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const baseUrl = getBaseUrl();
  const ogImage = `${baseUrl}${post.coverImage?.trim() || '/images/main/skyblue.png'}`;
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
          width: 1200,
          height: 630,
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

export async function generateStaticParams() {
  try {
    const slugs = await getPostSlugs();
    return slugs
      .map((slug) => slug.replace(/\.mdx$/, ''))
      .filter(Boolean)
      .map((slug) => ({ slug }));
  } catch {
    return getMdxOnlySlugs().map((slug) => ({ slug }));
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  // 関連記事: 同じカテゴリまたはタグが一致する記事（自身を除く最大3件）
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const sameCategory = p.category === post.category ? 2 : 0;
      const sharedTags = p.tags?.filter((t) => post.tags?.includes(t)).length ?? 0;
      return { post: p, score: sameCategory + sharedTags };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ post }) => post);

  // Extract headings using github-slugger to match rehype-slug IDs
  const slugger = new GithubSlugger();

  const headings = post.content
    .split('\n')
    .filter((line) => line.match(/^#{1,3}\s/))
    .map((line) => {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s/, '').replace(/\*\*/g, '');
      const id = slugger.slug(text);
      return { id, text, level };
    });

  const readingTime = calcReadingTime(post.content);

  const baseUrl = getBaseUrl();
  const ogImage = `${baseUrl}${post.coverImage?.trim() || '/images/main/skyblue.png'}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: ogImage,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: 'ざいざっく',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ざっくらぼ',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/images/main/logo.svg` },
    },
    url: `${baseUrl}/blog/${slug}`,
    keywords: post.tags?.join(', '),
    articleSection: post.category,
    inLanguage: 'ja-JP',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'ブログ', item: `${baseUrl}/reviews` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${baseUrl}/blog/${slug}` },
    ],
  };

  return (
    <article className="min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ScrollProgressBar />
      {post.published === false && (
        <div className="sticky top-0 z-50 w-full bg-yellow-400 text-yellow-900 text-sm font-semibold text-center py-2 px-4">
          🚧 この記事は非公開のプレビューです。リンクを知っている人のみ閲覧できます。
        </div>
      )}
      {/* Hero Header */}
      <div className="container mx-auto px-4 pt-8 md:pt-12 pb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          ホームへ戻る
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Cover Image */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 border border-border/50 shadow-sm">
            <SafeImage
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Metadata */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {post.tags?.includes(post.category) ? (
                <Link
                  href={`/tags/${encodeURIComponent(post.category)}`}
                  className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  {post.category}
                </Link>
              ) : (
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20">
                  {post.category}
                </span>
              )}
              <div className="flex items-center text-muted-foreground text-sm">
                <time>{post.date}</time>
                <span className="mx-2">•</span>
                <span>{readingTime} 分で読めます</span>
                <span className="mx-2">•</span>
                <ViewCounter slug={slug} />
                <span className="mx-2">•</span>
                <ShareMenu title={post.title} slug={slug} />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-outfit text-foreground tracking-tight leading-tight">
              <BudouxText>{post.title}</BudouxText>
            </h1>
            {post.subtitle && (
              <p className="text-xl md:text-2xl text-muted-foreground font-medium mt-2 leading-relaxed">
                <BudouxText>{post.subtitle}</BudouxText>
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {post.tags?.filter((tag) => tag !== post.category).map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
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
              remarkPlugins: [],
            },
          }}
        />

        {/* Share Section */}
        <div className="relative my-20 pt-10 pb-12 px-6 rounded-3xl border border-border/50 bg-gradient-to-b from-secondary/20 to-background">
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold font-outfit tracking-tight">
                読んでくれてありがとう！
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                この記事が面白かったら、ぜひSNSでシェアしてください。<br />
                感想やコメントもお待ちしています
              </p>
            </div>

            <ShareMenu
              title={post.title}
              slug={slug}
              label="この記事をシェア"
              variant="primary"
              popupPosition="top"
            />
          </div>
        </div>

        {/* 関連記事 */}
        {relatedPosts.length > 0 && (
          <div className="my-16 not-prose">
            <h2 className="text-xl font-bold font-outfit mb-6 text-foreground">関連記事</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <SafeImage
                      src={related.coverImage}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <span className="text-xs text-primary font-semibold">{related.category}</span>
                    <h3 className="text-sm font-bold font-outfit leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      <BudouxText>{related.title}</BudouxText>
                    </h3>
                    <time className="text-xs text-muted-foreground mt-auto">{related.date}</time>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 前後ナビゲーション */}
        <nav className="my-16 not-prose grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group flex items-start gap-3 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground mb-1">前の記事</div>
                <div className="text-sm font-bold font-outfit line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  <BudouxText>{prevPost.title}</BudouxText>
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex items-start gap-3 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all duration-300 sm:flex-row-reverse sm:text-right"
            >
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground mb-1">次の記事</div>
                <div className="text-sm font-bold font-outfit line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  <BudouxText>{nextPost.title}</BudouxText>
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </article>
  );
}
