"use client";

import React, { useState, useMemo } from 'react';
import { BlogPost } from '@/lib/mdx';
import { BlogList } from './BlogList';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FilteredBlogListProps {
  posts: BlogPost[];
  allTags: string[];
}

export function FilteredBlogList({ posts, allTags }: FilteredBlogListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter(post => post.tags?.includes(selectedTag));
  }, [posts, selectedTag]);

  return (
    <div className="space-y-8">
      {/* Tag Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            !selectedTag 
              ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              selectedTag === tag
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-center text-muted-foreground text-sm">
        Testing displaying {filteredPosts.length} matches
      </div>

      {/* Blog List */}
      <AnimatePresence mode="wait">
        <motion.div
           key={selectedTag || 'all'}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.3 }}
        >
            <BlogList posts={filteredPosts} />
        </motion.div>
      </AnimatePresence>
      
      {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
              No articles found with this tag.
          </div>
      )}
    </div>
  );
}
