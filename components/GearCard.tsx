"use client";

import React from 'react';
import { GearItem } from '@/lib/gear';
import { motion } from 'framer-motion';
import ExportedImage from "next-image-export-optimizer";
import { BudouxText } from './ui/BudouxText';

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

      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/20">
        <ExportedImage
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <span className="text-primary text-xs font-bold uppercase tracking-wider">
          {item.category}
        </span>
        <h3 className="font-outfit font-bold text-foreground text-[clamp(1rem,4vw,1.125rem)] mt-1 group-hover:text-primary transition-colors leading-tight">
          <BudouxText>{item.name}</BudouxText>
        </h3>
      </div>
    </motion.div>
  );
}
