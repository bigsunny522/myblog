"use client";

import React, { useState } from 'react';
import { GearItem } from '@/lib/gear';
import { motion } from 'framer-motion';
import { GearCard } from './GearCard';
import { Modal } from './Modal';
import { BudouxText } from './ui/BudouxText';

import { ScrollReveal } from './ui/ScrollReveal';

export function GearSection({ items }: { items: GearItem[] }) {
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  
  // Duplicate items for seamless infinite scroll
  const marqueeItems = [...items, ...items];

  return (
    <section className="pb-8 pt-0 md:pb-20 md:pt-0 overflow-hidden relative">
      <ScrollReveal direction="up" distance={40} className="container mx-auto px-6 mb-10 flex items-end justify-between">
        <div className="space-y-1">
            <h2 className="text-[clamp(1.875rem,4vw,2.25rem)] font-bold font-outfit leading-tight">My Gear</h2>
            <BudouxText as="p" className="text-muted-foreground text-sm">実際に愛用しているガジェットのレビュー</BudouxText>
        </div>
        <a href="/gear" className="text-primary font-bold hover:underline flex items-center gap-1 group">
          <BudouxText>すべて見る</BudouxText> <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </ScrollReveal>

      {/* Marquee Container */}
      <ScrollReveal delay={0.2} direction="up" distance={40} className="relative w-full">
          {/* Gradient Masks for smooth fade out at edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <motion.div 
            className="flex gap-6 w-max"
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
        {selectedGear && (
          <div className="flex flex-col md:flex-row h-full md:h-[500px]">
            <div className="relative w-full md:w-1/2 bg-secondary h-64 md:h-full shrink-0">
              <img 
                src={selectedGear.image} 
                alt={selectedGear.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-8 space-y-4 bg-background w-full md:w-1/2 overflow-y-auto max-h-[60vh] md:max-h-full">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-wider">
                  {selectedGear.category}
                </span>
                <h2 className="text-[clamp(1.5rem,4vw,1.875rem)] font-bold font-outfit mt-1 text-foreground leading-tight">
                  <BudouxText>{selectedGear.name}</BudouxText>
                </h2>
              </div>
              
              <BudouxText as="p" className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">
                {selectedGear.description}
              </BudouxText>

              {selectedGear.specs && (
                <div className="bg-secondary/30 rounded-lg p-4 mt-auto">
                  <h4 className="font-semibold text-xs mb-3 text-foreground uppercase tracking-wide">Specifications</h4>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-2 text-xs">
                    {Object.entries(selectedGear.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-border/50 py-1 last:border-0">
                        <span className="text-muted-foreground">{key}</span>
                        {value.startsWith('http') ? (
                          <a 
                            href={value} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-medium text-primary text-right truncate max-w-[150px] md:max-w-[200px] hover:underline"
                          >
                            {value}
                          </a>
                        ) : (
                          <span className="font-medium text-foreground text-right truncate max-w-[150px] md:max-w-[200px]"><BudouxText>{value}</BudouxText></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
