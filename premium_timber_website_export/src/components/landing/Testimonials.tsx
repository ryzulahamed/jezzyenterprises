'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
  location: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: "We have had a consistently reliable business relationship with them. Their teak logs are of excellent quality, competitively priced, and every order is handled with professionalism. They are a trusted partner we can confidently recommend.",
    author: "Vasanth Patel",
    role: "Managing Director",
    company: "Shiva Lakshmi Sawmill",
    location: "Trichy"
  },
  {
    id: 2,
    quote: "Their commitment to quality and timely delivery has always impressed us. They offer genuine products at fair prices while maintaining complete transparency in every transaction. A dependable supplier for premium timber.",
    author: "Veera",
    role: "Managing Director",
    company: "Veera Samy Sawmill",
    location: "Poombuhar"
  },
  {
    id: 3,
    quote: "Working with them has always been smooth and trustworthy. Their consistent quality, honest business practices, and competitive pricing make them one of the most reliable partners in the timber industry. I highly value our long-standing association.",
    author: "Sithambaram",
    role: "Managing Director",
    company: "Janaki Yard",
    location: "Sales Agent"
  }
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((prevIndex) => (prevIndex === 0 ? TESTIMONIALS.length - 1 : prevIndex - 1));
  };

  const next = () => {
    setIndex((prevIndex) => (prevIndex === TESTIMONIALS.length - 1 ? 0 : prevIndex + 1));
  };

  const current = TESTIMONIALS[index];

  return (
    <section className="py-20 md:py-28 bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
        
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">
          Client Endorsements
        </span>

        {/* Carousel slide container */}
        <div className="relative min-h-[220px] sm:min-h-[180px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Quote Icon */}
              <div className="flex justify-center">
                <Quote className="h-8 w-8 text-amber-500/20 rotate-180" />
              </div>
              
              <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto text-stone-700 dark:text-zinc-300">
                "{current.quote}"
              </p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">{current.author}</h4>
                <p className="text-[10px] text-stone-500 dark:text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
                  {current.role}, {current.company} — <span className="text-amber-500">{current.location}</span>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={prev}
            className="p-3 rounded-full liquid-glass spatial-card hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </button>
          
          {/* Indicator dots */}
          <div className="flex gap-1.5">
            {TESTIMONIALS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  index === idx ? 'w-5 bg-amber-500' : 'w-1.5 bg-stone-300 dark:bg-zinc-850'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="p-3 rounded-full liquid-glass spatial-card hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>

      </div>
    </section>
  );
}
