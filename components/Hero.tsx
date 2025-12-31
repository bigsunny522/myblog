"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ExportedImage from "next-image-export-optimizer";
import { BudouxText } from './ui/BudouxText';

const backgroundSlides = [
  "/images/slideshow/slide1.JPG",
  "/images/slideshow/slide2.JPG",
  "/images/slideshow/slide3.JPG",
  "/images/slideshow/slide4.jpg",
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-screen lg:min-h-[600px] flex flex-col lg:flex-row items-center">
      
      {/* Background Decor (Left Side only) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none opacity-50 -translate-x-1/2 -translate-y-1/2" />
      
      {/* Container for Text Content */}
      <div className="w-full px-6 lg:h-full relative z-10 flex flex-1 items-center py-12 lg:py-0 order-2 lg:order-1">
        <div className="w-full lg:w-[45%]">
            
            {/* Left Column: Text */}
            <div className="space-y-8 max-w-2xl">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.05,
                                delayChildren: 0.1
                            }
                        }
                    }}
                >
                    <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-bold font-outfit tracking-tighter text-foreground text-balance leading-none py-1">
                    {/* "Handwriting" Reveal Animation */}
                        <motion.span
                            className="inline-block relative overflow-hidden pb-1"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ 
                                duration: 1.2, 
                                ease: "easeInOut",
                                delay: 0.2
                            }}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            Smart Tech,
                        </motion.span>
                    <br />
                        <motion.span
                            className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 inline-block relative overflow-hidden pb-1"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ 
                                duration: 1.2, 
                                ease: "easeInOut",
                                delay: 0.8 // Overlap for smoother flow
                            }}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            Richer Life.
                        </motion.span>
                    </h1>
                </motion.div>
                
                <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-[clamp(0.9rem,3vw,1.25rem)] text-muted-foreground max-w-lg leading-relaxed text-pretty font-medium"
                >
                    <BudouxText>スマートな技術で、人生をより豊かに。</BudouxText><br />
                    <BudouxText>最新デバイスの実機レビューと、生活を変えるデジタルの活用術をお届けします。</BudouxText>
                </motion.p>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="flex flex-nowrap gap-2 sm:gap-4 justify-center lg:justify-start"
                >
                    <Link href="/reviews" className="group px-5 py-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all font-bold shadow-xl shadow-primary/20 relative overflow-hidden whitespace-nowrap text-sm sm:text-base">
                        <span className="relative z-10">記事を読む</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                    <Link href="/about" className="px-5 py-4 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-all font-bold border border-border/50 whitespace-nowrap text-sm sm:text-base">
                        サイトについて
                    </Link>
                </motion.div>
            </div>

            {/* Right Column: Empty here because image is absolute */}
        </div>
      </div>

      {/* Full Height/Width Slideshow (Right Side) */}
      <div className="relative w-full h-[50vh] min-h-[300px] lg:absolute lg:inset-y-0 lg:right-0 lg:w-[55%] lg:h-full z-0 order-1 lg:order-2">
            <AnimatePresence mode="popLayout">
            <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0"
            >
                <ExportedImage 
                src={backgroundSlides[currentSlide]} 
                alt="Hero Slideshow" 
                fill
                priority={true}
                className="w-full h-full object-cover"
                />
                {/* Overlay for text contrast if needed, mostly for mobile where text might stack or just aesthetic */}
                <div className="absolute inset-0 bg-black/10 lg:bg-transparent" />
                {/* Gradient fade to left (desktop only) to blend with background if desired, or keep hard edge */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent hidden lg:block" />
            </motion.div>
            </AnimatePresence>
      </div>

    </section>
  );
}
