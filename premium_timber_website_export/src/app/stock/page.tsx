'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { inventoryService } from '../../services/inventoryService';
import { Search, SlidersHorizontal, Anchor, Layers, Sparkles, Scale, Info, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StockCatalogPage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const data = await inventoryService.getContainers();
        setContainers(data);
      } catch (err) {
        console.error('Error fetching inventory list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  // Filter & Search Logic
  const filteredContainers = (containers || [])
    .filter(item => {
      if (!item) return false;
      // Drafts are hidden from public buyers until published by admin
      if (item.isDraft) return false;
      const matchesSearch = 
        (item.container_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.species || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.warehouse || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = selectedCountry === 'All' || item.countryName === selectedCountry;
      const matchesGrade = selectedGrade === 'All' || item.grade === selectedGrade;
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
      const matchesSize = selectedSize === 'All' || item.size === selectedSize;

      return matchesSearch && matchesCountry && matchesGrade && matchesStatus && matchesSize;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.arrivalDate || 0).getTime() - new Date(a.arrivalDate || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.arrivalDate || 0).getTime() - new Date(b.arrivalDate || 0).getTime();
      if (sortBy === 'cft-desc') return (b.cft || 0) - (a.cft || 0);
      if (sortBy === 'cft-asc') return (a.cft || 0) - (b.cft || 0);
      return 0;
    });

  // Extract unique filter keys
  const uniqueCountries = ['All', ...Array.from(new Set((containers || []).map(c => c?.countryName || '').filter(Boolean)))];
  const uniqueGrades = ['All', 'FEQ', 'Grade A', 'Grade B'];
  const uniqueStatuses = ['All', 'available', 'reserved', 'sold'];

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500 pt-28 pb-20 select-none">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          {/* Sub-label above directory grid */}
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Live Stock Directory
            </span>
            <p className="text-stone-500 dark:text-zinc-450 text-xs sm:text-sm leading-relaxed">
              Browse port shipments and yard inventory. Access individual spec sheets, CFT volumes, and log configurations to submit reservation requests directly via WhatsApp.
            </p>
          </div>

          {/* Filtering Hub Controls */}
          <div className="p-6 rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900 space-y-6">
            
            {/* Top row: search & sorting */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search container ID, species, or warehouse..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                />
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs dark:border-zinc-800 dark:bg-zinc-950/40 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="newest">Newest Arrival</option>
                  <option value="oldest">Oldest Arrival</option>
                  <option value="cft-desc">Volume (High to Low)</option>
                  <option value="cft-asc">Volume (Low to High)</option>
                </select>
              </div>

            </div>

            {/* Bottom Row: Detailed Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-100 dark:border-zinc-800/80">
              
              {/* Country */}
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Origin Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs dark:border-zinc-800 dark:bg-zinc-950/45 focus:outline-none cursor-pointer"
                >
                  {uniqueCountries.map(co => (
                    <option key={co} value={co}>{co}</option>
                  ))}
                </select>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Quality Grade</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs dark:border-zinc-800 dark:bg-zinc-950/45 focus:outline-none cursor-pointer"
                >
                  {uniqueGrades.map(gr => (
                    <option key={gr} value={gr}>{gr}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Availability</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs dark:border-zinc-800 dark:bg-zinc-950/45 focus:outline-none cursor-pointer"
                >
                  {uniqueStatuses.map(st => (
                    <option key={st} value={st}>{st === 'All' ? 'All' : st.charAt(0).toUpperCase() + st.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Container Size */}
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Cargo Size</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs dark:border-zinc-800 dark:bg-zinc-950/45 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Sizes</option>
                  <option value="40ft">40 ft Container</option>
                  <option value="20ft">20 ft Container</option>
                </select>
              </div>

            </div>

          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 rounded-2xl bg-stone-200/50 dark:bg-zinc-900/50 animate-pulse border border-stone-200/40 dark:border-zinc-800" />
              ))}
            </div>
          ) : filteredContainers.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-stone-200 p-8 dark:border-zinc-900 max-w-md mx-auto space-y-4">
              <SlidersHorizontal className="h-10 w-10 text-stone-400 mx-auto" />
              <h3 className="font-semibold text-sm">No containers match filters</h3>
              <p className="text-xs text-stone-400 dark:text-zinc-500 leading-relaxed">Try adjusting your origin country, logs size, or query to discover available stock.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCountry('All'); setSelectedGrade('All'); setSelectedStatus('All'); setSelectedSize('All'); }}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredContainers.map((item) => {
                
                // Color mapping for badges
                const statusColors = {
                  available: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
                  reserved: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                  sold: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                };

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="group rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md dark:border-zinc-900 dark:bg-zinc-900/60 transition-all flex flex-col justify-between hover:border-emerald-600/35 dark:hover:border-emerald-600/35"
                  >
                    <Link 
                      href={`/stock/${item.container_number}`} 
                      className="flex flex-col h-full justify-between cursor-pointer"
                    >
                      <div>
                        {/* Image Thumbnail */}
                        <div className="h-56 w-full overflow-hidden relative">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1546482502-0dfb4398c88f?auto=format&fit=crop&w=600&q=80'}
                            alt={item.container_number}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur text-stone-900 shadow-sm`}>
                              {item.grade}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider backdrop-blur shadow-sm ${statusColors[item.status as keyof typeof statusColors]}`}>
                              {item.status}
                            </span>
                          </div>
                          <span className="absolute bottom-3 right-4 text-[10px] font-bold bg-zinc-950/70 text-zinc-100 px-2 py-0.5 rounded backdrop-blur">
                            {item.size}
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-base flex items-center gap-1.5">
                              <span className="text-amber-500">{item.countryFlag}</span>
                              <span>{item.container_number}</span>
                            </h3>
                            <span className="text-[10px] text-stone-400 dark:text-zinc-550 uppercase font-semibold">
                              {new Date(item.arrivalDate).getTime() <= new Date().setHours(0,0,0,0) ? 'Arrived' : 'Arrival'} {item.arrivalDate}
                            </span>
                          </div>

                          <div className="flex justify-between items-center bg-stone-50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-stone-200/50 dark:border-zinc-800/80">
                            <span className="text-[9px] uppercase font-bold text-stone-400">Rate per CFT</span>
                            <span className="text-xs font-black text-amber-600 dark:text-amber-500">
                              {(() => {
                                if (!item.ratePerCft) return 'Contact Sales';
                                const str = item.ratePerCft.toString().trim();
                                if (str.includes('-')) return `₹${str}`;
                                const num = parseFloat(str);
                                return isNaN(num) ? `₹${str}` : `₹${num.toLocaleString('en-IN')}`;
                              })()}
                            </span>
                          </div>

                          {/* Specs grid */}
                          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-stone-100 dark:border-zinc-800 text-xs">
                            <div className="flex items-center gap-2 text-stone-500 dark:text-zinc-400">
                              <Scale className="h-4 w-4 text-amber-500 flex-shrink-0" />
                              <div>
                                <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Volume</p>
                                <p className="font-semibold text-stone-850 dark:text-zinc-200 mt-0.5">
                                  {item.cft} CFT ({(() => {
                                    if (item.cbm !== undefined && item.cbm !== null && item.cbm !== '') {
                                      if (typeof item.cbm === 'number') return item.cbm.toFixed(3);
                                      const str = item.cbm.toString().trim();
                                      const num = parseFloat(str);
                                      if (!isNaN(num) && !str.includes('-')) return num.toFixed(3);
                                      return str;
                                    }
                                    if (item.cft !== undefined && item.cft !== null && item.cft !== '') {
                                      const num = typeof item.cft === 'number' ? item.cft : parseFloat(item.cft);
                                      if (!isNaN(num)) return (num / 35.3147).toFixed(3);
                                    }
                                    return '0.000';
                                  })()} CBM)
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-stone-500 dark:text-zinc-400">
                              <Layers className="h-4 w-4 text-amber-500 flex-shrink-0" />
                              <div>
                                <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Log Count</p>
                                <p className="font-semibold text-stone-850 dark:text-zinc-200 mt-0.5">{item.logsCount} Logs</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-stone-500 dark:text-zinc-400 col-span-2">
                              <Anchor className="h-4 w-4 text-amber-500 flex-shrink-0" />
                              <div>
                                <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Dimensions</p>
                                <p className="font-semibold text-stone-850 dark:text-zinc-200 mt-0.5">
                                  L: {item.avgLength}{item.lengthUnit || 'ft'} | Girth: {item.avgDiameter}{item.girthUnit || 'cm'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-stone-500 dark:text-zinc-400 col-span-2 pt-1 border-t border-stone-150/60 dark:border-zinc-850">
                              <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                              <div>
                                <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Storage Yard Location</p>
                                <p className="font-semibold text-stone-850 dark:text-zinc-200 mt-0.5">
                                  {item.warehouse || 'Tuticorin Port Transit Yard'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="px-6 pb-6 pt-2">
                        <div className="w-full py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 btn-light-up font-semibold text-[10px] tracking-wider uppercase text-center block dark:border-zinc-800 dark:bg-zinc-900/30 shadow-sm">
                          Inspect Specifications
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
