import React from 'react';
import Link from 'next/link';
import { HomePostTabs } from '@/components/HomePostTabs';
import { getAllPosts } from '@/lib/mdx';
import { getAllGearItems } from '@/lib/gear-data';
import { GearSection } from '@/components/GearSection';
import { Hero } from '@/components/Hero';
import { SectionDivider } from '@/components/ui/SectionDivider';

import { OpeningAnimation } from '@/components/OpeningAnimation';

export default function Home() {
  const posts = getAllPosts();
  const gearItems = getAllGearItems();
  const latestPosts = posts.slice(0, 3);
  const recommendedPosts = posts.filter(post => post.recommended).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <OpeningAnimation />
      <div className="relative z-10">
        <Hero />
      </div>

      {/* Article List Section: Use Brand Color (Blue) nuance for distinct background */}
      <section className="w-full bg-blue-50 dark:bg-[#0B1120] py-16 lg:py-24 border-y border-primary/10 relative">
        
        <div className="container pb-16 mx-auto px-6 relative z-10">
          <HomePostTabs latestPosts={latestPosts} recommendedPosts={recommendedPosts} />
          
          <div className="mt-8 flex justify-center md:hidden">
            <Link href="/reviews" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2">
              すべて見る <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Gear Section */}
      <div className="relative bg-background">
         <SectionDivider type="wave" position="top" fill="fill-background" height="h-20 md:h-32" />
         <GearSection items={gearItems} />
      </div>

    </div>
  );
}


