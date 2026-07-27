'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X } from 'lucide-react';

interface GalleryItem {
  id: number;
  category: 'warehouse' | 'containers' | 'logs' | 'transport';
  title: string;
  url: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All Media' },
  { id: 'warehouse', name: 'Stock Yards' },
  { id: 'containers', name: 'Containers' },
  { id: 'logs', name: 'Teak Logs' },
  { id: 'transport', name: 'Logistics' },
];

export default function Gallery() {
  const [filter, setFilter] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('timber_public_gallery');
    if (stored) {
      setGalleryItems(JSON.parse(stored));
    } else {
      localStorage.setItem('timber_public_gallery', JSON.stringify([]));
      setGalleryItems([]);
    }
  }, []);

  // Listen for storage events (for real-time update in preview)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('timber_public_gallery');
      if (stored) {
        setGalleryItems(JSON.parse(stored));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Poll for updates in single-tab environments
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredItems = filter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter);

  return (
    <section className="py-20 md:py-28 bg-white text-stone-900 dark:bg-black dark:text-zinc-100 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">
              Media Gallery
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display">
              Yard Operations & Shipments
            </h2>
          </div>
          
          {/* Tabs Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border spatial-card liquid-glow tactile-bounce ${
                  filter === cat.id
                    ? 'border-emerald-600 bg-emerald-600 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-950 shadow-md shadow-emerald-500/10'
                    : 'liquid-glass border-stone-200/50 dark:border-zinc-900/60 text-stone-500 dark:text-zinc-400 hover:text-stone-850 dark:hover:text-zinc-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className="relative h-64 sm:h-72 rounded-3xl overflow-hidden cursor-pointer group liquid-glass spatial-card liquid-glow"
            >
              <img
                src={item.url}
                alt={item.title}
                className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" />
              <span className="absolute bottom-5 left-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="h-4.5 w-4.5 text-amber-500" />
                <span>{item.title}</span>
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900/70 border border-zinc-800 text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center">
            <img
              src={activePhoto.url}
              alt={activePhoto.title}
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
            />
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-zinc-500">
              {activePhoto.title}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
