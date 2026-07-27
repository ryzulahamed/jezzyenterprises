'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, RefreshCw, Eye, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface GalleryItem {
  id: number;
  category: 'warehouse' | 'containers' | 'logs' | 'transport';
  title: string;
  url: string;
}



export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [newImage, setNewImage] = useState({
    title: '',
    url: '',
    category: 'logs' as GalleryItem['category']
  });

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('timber_public_gallery');
      if (stored) {
        setGallery(JSON.parse(stored));
      } else {
        localStorage.setItem('timber_public_gallery', JSON.stringify([]));
        setGallery([]);
      }
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // No size limit on image uploads
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewImage(prev => ({
        ...prev,
        url: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.title.trim()) {
      alert('Please fill out the photo title.');
      return;
    }

    let imageUrl = newImage.url.trim();
    if (!imageUrl) {
      // Use a high-quality default wood/timber catalog photo placeholder
      imageUrl = 'https://images.unsplash.com/photo-1546482502-0dfb4398c88f?auto=format&fit=crop&w=800&q=80';
    } else {
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:image')) {
        alert('Please enter a valid HTTP/HTTPS image URL link.');
        return;
      }
    }

    const newItem: GalleryItem = {
      id: Date.now(),
      title: newImage.title.trim(),
      url: imageUrl,
      category: newImage.category
    };

    const updated = [...gallery, newItem];
    setGallery(updated);
    localStorage.setItem('timber_public_gallery', JSON.stringify(updated));

    // Reset Form
    setNewImage({
      title: '',
      url: '',
      category: 'logs'
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleDeleteImage = (id: number) => {
    if (!confirm('Are you sure you want to remove this image from the public gallery?')) return;
    const updated = gallery.filter(item => item.id !== id);
    setGallery(updated);
    localStorage.setItem('timber_public_gallery', JSON.stringify(updated));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === gallery.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...gallery];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    setGallery(copy);
    localStorage.setItem('timber_public_gallery', JSON.stringify(copy));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white mb-2 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Public Media Gallery</h1>
          <p className="text-xs text-stone-500 dark:text-zinc-455 mt-1">Manage, rearrange, and publish photos to the public landing page media section.</p>
        </div>

        <div className="flex items-center gap-2.5">
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form (1 col) */}
        <div className="space-y-6">
          <form onSubmit={handleAddImage} className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-zinc-850">
              <Sparkles className="h-4.5 w-4.5 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Add Gallery Photo</h3>
            </div>

            {/* Photo Title */}
            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Photo Title / Label *</label>
              <input
                required
                type="text"
                value={newImage.title}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                placeholder="e.g. Tuticorin yard space logs stack"
                className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 text-stone-850 dark:text-zinc-150"
              />
            </div>

            {/* Local Photo Uploader */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest">Upload Local Photo</label>
              <div className="relative border border-dashed border-stone-200 dark:border-zinc-800 rounded-xl p-4 bg-stone-50/50 dark:bg-zinc-950/20 text-center hover:border-amber-500 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {newImage.url && newImage.url.startsWith('data:image') ? (
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={newImage.url} 
                      alt="Preview" 
                      className="h-16 w-auto rounded-lg object-cover border border-stone-200 dark:border-zinc-800 shadow-sm"
                    />
                    <span className="text-[9px] text-green-600 dark:text-green-400 font-semibold">✓ Image selected (Ready to publish)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 select-none py-1">
                    <ArrowUp className="h-5 w-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                    <span className="text-[10px] text-stone-600 dark:text-zinc-400 font-bold">Choose photo file</span>
                    <span className="text-[8px] text-stone-400 dark:text-zinc-550">Any file size allowed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Web Image URL */}
            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Or Web Image URL link</label>
              <input
                type="text"
                value={newImage.url}
                onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                placeholder="e.g. https://images.unsplash.com/photo-... (Optional)"
                className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 text-stone-850 dark:text-zinc-150"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Section Category *</label>
              <select
                value={newImage.category}
                onChange={(e) => setNewImage({ ...newImage, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 cursor-pointer text-stone-850 dark:text-zinc-150 font-medium"
              >
                <option value="logs">Teak Logs</option>
                <option value="warehouse">Stock Yards</option>
                <option value="containers">Containers</option>
                <option value="transport">Logistics</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400 text-xs font-bold tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all mt-2"
            >
              <Plus className="h-4 w-4" />
              <span>Publish Photo</span>
            </button>

            {success && (
              <p className="text-[10px] text-center text-green-600 font-semibold mt-1">✓ Photo added successfully!</p>
            )}
          </form>
        </div>

        {/* Right Gallery Listing (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-stone-200 animate-pulse rounded-2xl dark:bg-zinc-900 border border-stone-200/40 dark:border-zinc-800/40" />
              ))}
            </div>
          ) : gallery.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-stone-200 p-8 dark:border-zinc-900 max-w-md mx-auto space-y-3">
              <Eye className="h-10 w-10 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-zinc-300">No Custom Photos Published</h3>
              <p className="text-[11px] text-stone-500 dark:text-zinc-455 leading-relaxed">
                Add and publish photos above to seed the public media gallery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gallery.map((item, index) => (
                <div key={item.id} className="group p-3 rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900/60 flex flex-col justify-between gap-3 transition-all hover:shadow-md">
                  
                  {/* Photo Preview block */}
                  <div className="h-32 rounded-xl overflow-hidden border border-stone-100 bg-stone-50 relative dark:border-zinc-850">
                    <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                    
                    {/* Category overlay */}
                    <span className="absolute top-2 left-2 text-[8px] font-extrabold uppercase bg-zinc-950/80 text-white px-2 py-0.5 rounded backdrop-blur-md shadow">
                      {item.category === 'warehouse' ? 'Stock Yard' : item.category === 'logs' ? 'Logs' : item.category === 'containers' ? 'Containers' : 'Logistics'}
                    </span>
                  </div>

                  {/* Details & Actions */}
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-[11px] font-bold text-stone-850 dark:text-zinc-200 truncate">{item.title}</h4>
                      <p className="text-[9px] text-stone-400 dark:text-zinc-500 truncate mt-0.5">{item.url}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 dark:border-zinc-850 pt-2.5 mt-1">
                      
                      {/* Rearrange arrows */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 border border-stone-200 dark:border-zinc-800 rounded-lg text-stone-500 hover:text-amber-500 hover:border-amber-500/30 transition-colors disabled:opacity-30 cursor-pointer"
                          title="Move Left / Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === gallery.length - 1}
                          className="p-1 border border-stone-200 dark:border-zinc-800 rounded-lg text-stone-500 hover:text-amber-500 hover:border-amber-500/30 transition-colors disabled:opacity-30 cursor-pointer"
                          title="Move Right / Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(item.id)}
                        className="px-2.5 py-1.5 border border-red-500/15 bg-red-500/5 hover:bg-red-650 hover:text-white dark:border-red-950 dark:bg-red-950/15 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white text-[9px] font-bold uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>

                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
