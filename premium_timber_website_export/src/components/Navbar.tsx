'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [brandName, setBrandName] = useState('JEZZY ENTERPRISES');
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Load dynamic brand name
    const saved = localStorage.getItem('timber_system_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.brandName) {
          setBrandName(parsed.brandName.toUpperCase());
        }
      } catch (e) {
        console.error(e);
      }
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Stock Catalog', href: '/stock' },
    { name: 'Origins', href: '/#origins' },
    { name: 'About', href: '/#about' },
    { name: 'FAQ', href: '/#faq' },
    { name: 'Contact Us', href: '/#contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-40 transition-all duration-500 ease-out print:hidden rounded-3xl py-3 liquid-glass shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider font-display uppercase text-amber-500 transition-colors">
                {brandName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isStockCatalog = link.name === 'Stock Catalog';
              const isActive = pathname === link.href || (pathname === '/' && link.href.startsWith('/#'));
              
              if (isStockCatalog) {
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs font-black tracking-wide uppercase px-4 py-2 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 liquid-glow ${
                      isActive
                        ? 'border-emerald-600 bg-emerald-600 text-white font-black shadow-md shadow-emerald-500/10'
                        : 'border-emerald-600/40 bg-emerald-600/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              }
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-semibold tracking-wide uppercase px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white/40 dark:hover:bg-zinc-800/30 border border-transparent hover:border-white/40 dark:hover:border-zinc-700/30 liquid-glow ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-stone-550 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action items */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-1.5 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-xl tracking-wider uppercase transition-all shadow-sm"
              >
                <User className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="flex items-center gap-2 px-4 py-1.5 bg-stone-900 hover:bg-stone-850 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-stone-100 text-xs font-semibold rounded-xl tracking-wider uppercase transition-all shadow-sm group"
              >
                <span>Portal</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg border border-stone-200/60 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[60px] z-30 md:hidden bg-white/95 border-b border-stone-200 dark:bg-zinc-950/95 dark:border-zinc-900/90 backdrop-blur-lg px-6 py-8 flex flex-col gap-6 shadow-xl"
          >
            {navLinks.map((link) => {
              const isStockCatalog = link.name === 'Stock Catalog';
              const isActive = pathname === link.href;
              
              if (isStockCatalog) {
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center px-4 py-3 border border-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-zinc-950 text-amber-500 font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-sm"
                  >
                    {link.name}
                  </Link>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-semibold uppercase tracking-wider ${
                    isActive
                      ? 'text-amber-500'
                      : 'text-stone-600 dark:text-zinc-300'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-stone-200 dark:border-zinc-800">
              {user ? (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Administrative Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
