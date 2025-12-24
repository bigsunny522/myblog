"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GearItem } from '@/lib/gear';
import { GearCard } from '@/components/GearCard';
import { Modal } from '@/components/Modal';

interface GearPageClientProps {
  items: GearItem[];
}

export function GearPageClient({ items }: GearPageClientProps) {
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(items.map(item => item.category)));
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold font-outfit text-foreground tracking-tight">
          使用デバイス
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          私が普段使用しているガジェットやデバイスを紹介します。
        </p>
      </div>

      <div className="space-y-8">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              !selectedCategory 
                ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <GearCard item={item} onClick={setSelectedGear} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

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
                <h2 className="text-2xl md:text-3xl font-bold font-outfit mt-1 text-foreground">
                  {selectedGear.name}
                </h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed text-sm">
                {selectedGear.description}
              </p>

              {selectedGear.specs && (
                <div className="bg-secondary/30 rounded-lg p-4 mt-auto">
                  <h4 className="font-semibold text-xs mb-3 text-foreground uppercase tracking-wide">Specifications</h4>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-2 text-xs">
                    {Object.entries(selectedGear.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-border/50 py-1 last:border-0">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium text-foreground text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
