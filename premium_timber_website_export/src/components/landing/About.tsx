'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function About() {
  const stats = [
    { label: 'Years of Sourcing', value: 35, suffix: '+' },
    { label: 'Import Countries', value: 14, suffix: '+' },
    { label: 'Containers Delivered', value: 2000, suffix: '+' },
    { label: 'Satisfied Dealers', value: 450, suffix: '+' },
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* About Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text Storytelling */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">
              Our Legacy
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display leading-tight">
                Sourcing the World's Finest Timber. Delivering Throughout South India.
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">Est. 1993 — 35+ Years of Global Sourcing</span>
            </div>
            <div className="space-y-4 text-xs sm:text-sm text-stone-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
              <p>
                Founded in <strong>1993</strong> and headquartered in the historic trade hub of <strong>Pudukkottai, Tamil Nadu</strong>, Jezzy Enterprises has spent over three decades building direct pipelines with premier forest plantations in South America and Africa. We hand-select the highest grades of Tectona grandis (Teak) logs to guarantee excellence in durability and aesthetics.
              </p>
              <p>
                Our timber logs are inspected and shipped directly under strict climate controls to minimise moisture defects. From sawmills and large-scale timber dealers to high-end furniture manufacturers and architects, our clients depend on us for consistent bulk supplies and unmatched cargo precision.
              </p>
            </div>
          </div>

          {/* Visual Accents & Stats Grid */}
          <div className="lg:col-span-5 relative">
            {/* Visual decorative block: Vercel style dark grid box */}
            <div className="absolute inset-0 z-0 bg-stone-200/50 dark:bg-zinc-900/40 rounded-2xl -rotate-2 scale-102 blur-sm" />
            
            <div className="relative z-10 grid grid-cols-2 gap-5 p-6 sm:p-8 rounded-2xl border border-stone-200 bg-white shadow-md dark:border-zinc-900 dark:bg-zinc-900">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-4 rounded-xl border border-stone-100 bg-stone-50/50 dark:border-zinc-800/40 dark:bg-zinc-950/40 text-center flex flex-col justify-center"
                >
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-500">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-stone-400 dark:text-zinc-500 tracking-wider uppercase mt-1">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
