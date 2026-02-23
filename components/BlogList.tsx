"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BlogPost } from '@/lib/mdx';
import { BudouxText } from './ui/BudouxText';

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post, index) => (
        <motion.article
          key={post.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="group flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <Link href={`/blog/${post.slug}`} className="block w-full aspect-video overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-medium text-muted-foreground">
              <span className="bg-secondary px-2.5 py-1 rounded-full text-secondary-foreground">
                {post.category}
              </span>
              {post.tags?.slice(0, 2).map(tag => (
                <span key={tag} className="text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))}
              <time dateTime={post.date} className="ml-auto">{post.date}</time>
            </div>
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-[clamp(1rem,4vw,1.25rem)] font-bold mb-3 group-hover:text-primary transition-colors font-outfit line-clamp-2 leading-tight">
                <BudouxText>{post.title}</BudouxText>
              </h2>
            </Link>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
              <BudouxText>{post.excerpt}</BudouxText>
            </p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-primary text-sm font-semibold flex items-center mt-auto group-hover:translate-x-1 transition-transform"
            >
              もっと読む <span className="ml-1">→</span>
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
