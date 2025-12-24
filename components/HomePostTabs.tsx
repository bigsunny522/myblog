"use client";

import React, { useState } from 'react';
import { BlogPost } from '@/lib/mdx';
import { BlogList } from './BlogList';
import { motion, AnimatePresence } from 'framer-motion';

interface HomePostTabsProps {
  latestPosts: BlogPost[];
  recommendedPosts: BlogPost[];
}

import { ScrollReveal } from './ui/ScrollReveal';

export function HomePostTabs({ latestPosts, recommendedPosts }: HomePostTabsProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'recommended'>('latest');

  return (
    <ScrollReveal className="w-full" threshold={0.2} duration={0.6}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-bold font-outfit">
           {activeTab === 'latest' ? 'New Arrivals' : 'Editors\' Choice'}
        </h2>
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-secondary rounded-full relative border border-border/20 shadow-sm">
          <div className="absolute inset-0 rounded-full bg-secondary" />
          {['latest', 'recommended'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                relative px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 z-10 border border-transparent
                ${activeTab === tab 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }
              `}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-full shadow-md border border-white/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-20">
                {tab === 'latest' ? 'Latest' : 'Recommended'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
             <BlogList posts={activeTab === 'latest' ? latestPosts : recommendedPosts} />
          </motion.div>
        </AnimatePresence>
      </div>
    </ScrollReveal>
  );
}
