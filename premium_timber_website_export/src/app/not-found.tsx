'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[100px] dark:bg-amber-500/5" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-stone-400/20 blur-[100px] dark:bg-zinc-800/10" />
      </div>

      <div className="relative z-10 w-full max-w-lg p-6 text-center space-y-8">
        
        {/* Animated Visual representation of a "broken wood joint" or target ring */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative h-32 w-32 flex items-center justify-center"
          >
            {/* Outer concentric rings representing growth logs rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-amber-500/20 dark:border-amber-500/10"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
              className="absolute inset-3 rounded-full border border-stone-300 dark:border-zinc-800"
            />
            <div className="absolute inset-8 rounded-full border border-amber-500/30 flex items-center justify-center bg-stone-100/50 dark:bg-zinc-900/50">
              <span className="text-2xl font-bold tracking-wider text-amber-600 dark:text-amber-500">404</span>
            </div>
          </motion.div>
        </div>

        <div className="space-y-3">
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Timber Not Found
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-stone-500 dark:text-zinc-400 text-sm max-w-md mx-auto leading-relaxed"
          >
            The timber container layout, spec sheet, or administrative node you are looking for has been sold, relocated, or temporarily archived.
          </motion.p>
        </div>

        {/* Action Controls */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
          
          <a
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </a>
        </motion.div>

        {/* Quick Search Tip */}
        <div className="pt-6 border-t border-stone-200/50 dark:border-zinc-800/40 text-xs text-stone-400 dark:text-zinc-500">
          <span>Are you looking for live stock? Try visiting our </span>
          <a href="/stock" className="text-amber-600 hover:underline dark:text-amber-500">stock catalog</a>.
        </div>
      </div>
    </div>
  );
}
