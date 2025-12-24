"use client";

import React from 'react';
import { GearItem } from '@/lib/gear';
import { motion } from 'framer-motion';

interface GearCardProps {
  item: GearItem;
  onClick: (item: GearItem) => void;
}

export function GearCard({ item, onClick }: GearCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item)}
      className="cursor-pointer group flex flex-col bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >

      <div className="aspect-[4/3] overflow-hidden bg-secondary/20">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <span className="text-primary text-xs font-bold uppercase tracking-wider">
          {item.category}
        </span>
        <h3 className="font-outfit font-bold text-foreground text-lg mt-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>
      </div>
    </motion.div>
  );
}
