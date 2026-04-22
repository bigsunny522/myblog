"use client";

import React, { useState } from 'react';
import { GearItem } from '@/lib/gear';
import { motion } from 'framer-motion';
import { GearCard } from './GearCard';
import { Modal } from './Modal';
import { GearDetails } from './GearDetails';
import { BudouxText } from './ui/BudouxText';

import { ScrollReveal } from './ui/ScrollReveal';

export function GearSection({ items }: { items: GearItem[] }) {
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  
  // Duplicate items for seamless infinite scroll
  const marqueeItems = [...items, ...items];

  return (
    <section className="pb-8 pt-0 md:pb-20 md:pt-0 overflow-hidden relative">
      <ScrollReveal direction="up" distance={40} className="container mx-auto px-lk-lg mb-lk-xl flex flex-col md:flex-row md:items-end justify-between gap-lk-md md:gap-0">
        <div className="space-y-1">
            <h2 className="text-[clamp(1.875rem,4vw,2.25rem)] font-bold font-outfit leading-tight">My Gear</h2>
            <BudouxText as="p" className="text-muted-foreground text-sm">実際に愛用しているガジェットのレビュー</BudouxText>
        </div>
        <a href="/gear" className="text-primary font-bold hover:underline flex items-center gap-1 group self-end md:self-auto">
          <BudouxText>すべて見る</BudouxText> <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </ScrollReveal>

      {/* Marquee Container */}
      <ScrollReveal delay={0.2} direction="up" distance={40} className="relative w-full">
          {/* Gradient Masks for smooth fade out at edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-lk-lg w-max"
            animate={{ x: "-50%" }}
            transition={{ 
                duration: 40, 
                ease: "linear", 
                repeat: Infinity 
            }}
          >
            {marqueeItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="w-[300px] shrink-0">
                  <GearCard item={item} onClick={setSelectedGear} /> {/* Always allow clicking */}
              </div>
            ))}
          </motion.div>
      </ScrollReveal>

      <Modal isOpen={!!selectedGear} onClose={() => setSelectedGear(null)}>
        {selectedGear && <GearDetails item={selectedGear} />}
      </Modal>
    </section>
  );
}
