"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useUIStore } from "@/lib/store/ui-store";
import { BudouxText } from "./ui/BudouxText";

// Module-level variable to track if animation has been shown in this page session (memory)
let hasShownInSession = false;

export const OpeningAnimation = () => {
  // Initialize state based on whether we've already shown it in this session
  const [show, setShow] = useState(!hasShownInSession);
  const showHeader = useUIStore((state) => state.showHeader);

  useEffect(() => {
    // If already shown in this memory session, ensure header is visible and return
    if (hasShownInSession) {
      showHeader();
      return;
    }

    // Check session storage as a secondary check for page reloads
    const hasVisitedStorage = sessionStorage.getItem("hasVisited");
    
    if (hasVisitedStorage) {
      // If found in storage but not in memory (e.g. reload), sync memory and skip
      hasShownInSession = true;
      setShow(false);
      showHeader();
    } else {
      // First time visit
      sessionStorage.setItem("hasVisited", "true");
      
      // Total duration for the loading animation
      const timer = setTimeout(() => {
        setShow(false);
        hasShownInSession = true; // Mark as shown in memory
        // Show header after animation finishes
        setTimeout(() => showHeader(), 500); 
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showHeader]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white text-zinc-800 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
          {/* Grid Background */}
          <div 
            className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
            style={{
                backgroundImage: `linear-gradient(#7BABFF 1px, transparent 1px), linear-gradient(90deg, #7BABFF 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}
          />

          {/* Main Circular HUD & Content */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* Complex Circular Animation Layer - Centered behind content */}
            {/* Dramatically increased Size to enclose text comfortably */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
                <svg className="w-[800px] h-[800px] md:w-[1200px] md:h-[1200px]" viewBox="0 0 400 400">
                    {/* Ring 1: Outer Dashed Ring - Slow Rotate */}
                    <motion.circle 
                        cx="200" cy="200" r="195" 
                        fill="none" stroke="#7BABFF" strokeWidth="1" strokeDasharray="10 20" opacity="0.3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, ease: "linear", repeat: Infinity }}
                    />
                    
                    {/* Ring 2: Segmented Tech Ring - Reverse Rotate */}
                    {/* Pushed outwards to make room for text */}
                    <motion.path
                        d="M200,10 A190,190 0 0,1 390,200"
                        fill="none" stroke="#7BABFF" strokeWidth="2" opacity="0.5"
                        initial={{ pathLength: 0, rotate: 0 }}
                        animate={{ pathLength: 1, rotate: -360 }}
                        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                    />
                    <motion.path
                        d="M200,390 A190,190 0 0,1 10,200"
                        fill="none" stroke="#7BABFF" strokeWidth="2" opacity="0.5"
                        initial={{ pathLength: 0, rotate: 0 }}
                        animate={{ pathLength: 1, rotate: -360 }}
                        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                    />

                    {/* Ring 3: Inner Data Ring with Ticks */}
                    {/* Expanded Radius to 170 to enclose text */}
                    <motion.circle 
                        cx="200" cy="200" r="170" 
                        fill="none" stroke="#7BABFF" strokeWidth="0.5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                    {Array.from({ length: 48 }).map((_, i) => (
                        <motion.line
                            key={i}
                            x1="200" y1="30" x2="200" y2="40"
                            stroke="#7BABFF" strokeWidth="1"
                            transform={`rotate(${i * 7.5} 200 200)`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.2, 0.8, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
                        />
                    ))}

                    {/* Ring 4: Core Spinning Arc */}
                    {/* Expanded Radius to 160 */}
                    <motion.circle
                        cx="200" cy="200" r="160"
                        fill="none" stroke="#7BABFF" strokeWidth="4" 
                        strokeDasharray="60 180" // Arc segment
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                    />
                     <motion.circle
                        cx="200" cy="200" r="155"
                        fill="none" stroke="#7BABFF" strokeWidth="1" 
                        strokeDasharray="20 40" 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                    />

                    {/* Decorative Geometric Elements */}
                    <motion.rect
                        x="190" y="5" width="20" height="5" fill="#7BABFF"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                     <motion.rect
                        x="190" y="390" width="20" height="5" fill="#7BABFF"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
                    />
                </svg>
            </div>

            {/* Content Container - Removed Boxy Border */}
            <div className="flex flex-col items-center gap-2 relative z-20">
                <motion.h1 
                    /* Reduced text size slightly to ensure fit within the circle */
                    className="text-[clamp(1.875rem,5vw,3.75rem)] font-bold font-keifont tracking-tight text-[#7BABFF] mb-4 leading-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ textShadow: "0 0 20px rgba(123,171,255,0.5)" }} // Glow effect
                >
                    <BudouxText>ざっくらぼ</BudouxText>
                </motion.h1>

                {/* Loading Bar - Integrated into Circular Design */}
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-[#7BABFF] font-keifont tracking-widest">LOADING</span>
                    <div className="relative w-32 h-[2px] bg-[#7BABFF]/20 rounded-none overflow-hidden">
                        <motion.div 
                            className="absolute top-0 left-0 h-full bg-[#7BABFF]"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.8, ease: "easeInOut" }}
                        />
                    </div>
                    <motion.span 
                        className="text-[10px] text-[#7BABFF] font-keifont tracking-widest"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        100%
                    </motion.span>
                </div>

                <motion.div
                    className="mt-6 text-[10px] text-[#7BABFF] font-mono tracking-[0.3em] opacity-70"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    SYSTEM INITIALIZED
                </motion.div>
            </div>
          </div>



        </motion.div>
      )}
    </AnimatePresence>
  );
};
