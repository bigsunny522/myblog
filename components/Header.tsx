"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useUIStore } from '@/lib/store/ui-store';
import { cn } from '@/lib/utils';
import { BudouxText } from './ui/BudouxText';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHeaderVisible = useUIStore((state) => state.isHeaderVisible);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-opacity duration-700",
      !isHeaderVisible && "opacity-0 pointer-events-none"
    )}>
      <div className="w-full flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center group">
          <div className="relative w-[21px] h-[21px] md:w-[25px] md:h-[25px] mr-2 flex-shrink-0">
             <div 
               className="absolute inset-0 bg-primary" 
               style={{
                 maskImage: 'url(/images/main/logo.svg)',
                 maskSize: 'contain',
                 maskPosition: 'center',
                 maskRepeat: 'no-repeat',
                 WebkitMaskImage: 'url(/images/main/logo.svg)',
                 WebkitMaskSize: 'contain',
                 WebkitMaskPosition: 'center',
                 WebkitMaskRepeat: 'no-repeat'
               }}
             />
          </div>
          <span className="font-keifont text-[clamp(1.25rem,4vw,1.5rem)] font-bold text-primary tracking-tight hover:opacity-90 transition-opacity">
            <BudouxText>ざっくらぼ</BudouxText>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="lk-nav hidden md:flex items-center text-sm font-medium">
          <Link href="/reviews" className="transition-colors hover:text-primary text-foreground/80 font-bold">
            Reviews
          </Link>
          <Link href="/gear" className="transition-colors hover:text-primary text-foreground/80 font-bold">
            Gear
          </Link>
<Link href="/about" className="transition-colors hover:text-primary text-foreground/80 font-bold">
            About
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-foreground" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background"
          >
            <nav className="flex flex-col space-y-4 p-6 text-sm font-medium">
              <Link
                href="/reviews"
                className="transition-colors hover:text-primary text-foreground/80 font-bold text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                href="/gear"
                className="transition-colors hover:text-primary text-foreground/80 font-bold text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Gear
              </Link>
<Link
                href="/about"
                className="transition-colors hover:text-primary text-foreground/80 font-bold text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}