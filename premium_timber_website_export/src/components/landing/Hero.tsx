'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

export default function Hero() {
  const [brandName, setBrandName] = useState('Jezzy Enterprises');

  useEffect(() => {
    const saved = localStorage.getItem('timber_system_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.brandName) setBrandName(parsed.brandName);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-white transition-colors duration-500 select-none">
      
      {/* Background Cinematic Visuals */}
      <div className="absolute inset-0 z-0">
        {/* Black & white graphic wood texture background */}
        <motion.div 
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 25, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.16] dark:opacity-[0.28] filter grayscale contrast-[1.9] brightness-[1.02] dark:invert pointer-events-none"
          style={{ backgroundImage: "url('/images/wood_vector_texture_bg.jpg')" }}
        />
        
        {/* Cinematic gradient vignette overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-50/95 via-stone-50/30 to-stone-50 dark:from-zinc-950/95 dark:via-zinc-950/50 dark:to-zinc-950" />
        
        {/* Premium Warm Lighting Overlay */}
        <div className="absolute top-[20%] left-[20%] w-[80%] h-[60%] rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-[150px]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-20 md:py-24 text-center flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8 max-w-3xl"
        >
          {/* Badge */}
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            First Export Quality (FEQ) Importers
          </span>
 
          {/* Headline */}
          <div className="space-y-3">
            <span className="block text-sm sm:text-base md:text-lg font-black uppercase tracking-[0.25em] text-stone-600 dark:text-zinc-400 font-display">
              {brandName}
            </span>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight font-display leading-[1.1]"
            >
              Premium Imported Teak.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400">
                Trusted Across South India.
              </span>
            </h1>
          </div>
 
          {/* Subheading */}
          <p
            className="text-stone-600 dark:text-stone-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Importing world-class teak logs directly from South America and Africa. Supplying sawmills, timber dealers, and furniture makers with unmatched quality.
          </p>
 
          {/* Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/stock"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/15 btn-light-up group cursor-pointer"
            >
              <span>View Available Stock</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-current" />
            </Link>
            
            <Link
              href="/#contact"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-stone-200 bg-white/80 text-stone-800 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 btn-light-up dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-white cursor-pointer"
            >
              <span>Contact Us</span>
            </Link>
          </div>
        </motion.div>
 
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-6 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' })}
        >
          <span className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-bold">Discover More</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            <ArrowDown className="h-4 w-4 text-amber-500" />
          </motion.div>
        </motion.div>
 
      </div>
    </section>
  );
}
