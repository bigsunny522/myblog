"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GearItem } from '@/lib/gear';
import { GearCard } from '@/components/GearCard';
import { Modal } from '@/components/Modal';
import { GearDetails } from '@/components/GearDetails';

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
        {selectedGear && <GearDetails item={selectedGear} />}
      </Modal>
    </div>
  );
}
