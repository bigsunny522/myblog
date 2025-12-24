'use client';

import React, { useRef } from 'react';
import { motion, useInView, UseInViewOptions } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}

export const ScrollReveal = ({
  children,
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  className = '',
  direction = 'up',
  distance = 30,
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, opacity: 0 };
      case 'down':
        return { y: -distance, opacity: 0 };
      case 'left':
        return { x: distance, opacity: 0 };
      case 'right':
        return { x: -distance, opacity: 0 };
      case 'none':
        return { opacity: 0 };
      default:
        return { y: distance, opacity: 0 };
    }
  };

  const initial = getInitialPosition();

  const animate = isInView
    ? { 
        x: 0, 
        y: 0, 
        opacity: 1,
        transition: { 
          duration, 
          delay, 
          ease: 'easeOut' as const
        } 
      }
    : initial;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={animate}
    >
      {children}
    </motion.div>
  );
};
