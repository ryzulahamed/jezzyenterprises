'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { inventoryService } from '../../../services/inventoryService';
import { Search, PlusCircle, Edit, Trash, Copy, ExternalLink, SlidersHorizontal, AlertTriangle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInventoryPage() {
  const router = useRouter();
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');

  // Dialog State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getContainers();
      setContainers(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await inventoryService.deleteContainer(deleteTargetId);
      setContainers(containers.filter(c => c.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Error deleting container:', err);
    }
  };

  const handlePublish = async (containerId: string) => {
    try {
      await inventoryService.updateContainer(containerId, { isDraft: false, status: 'available' });
      await fetchInventory();
    } catch (err) {
      console.error('Error publishing container logs:', err);
    }
  };

  const handleDuplicate = async (item: any) => {
    try {
      const duplicatedNum = `${item.container_number}-DUP-${Math.floor(Math.random() * 100)}`;
      const duplicated = {
        ...item,
        container_number: duplicatedNum,
        id: duplicatedNum,
        status: 'available',
        isDraft: true
      };
      await inventoryService.addContainer(duplicated);
      await fetchInventory();
    } catch (err) {
      console.error('Error duplicating container:', err);
    }
  };

  // Filter items
  const filtered = containers.filter(c => {
    const matchesSearch = (c.container_number || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.species || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || c.countryName === selectedCountry;
    const matchesGrade = selectedGrade === 'All' || c.grade === selectedGrade;
    
    let matchesStatus = true;
    if (selectedStatus === 'Drafts') {
      matchesStatus = c.isDraft === true;
    } else if (selectedStatus === 'Published') {
      matchesStatus = !c.isDraft;
    } else if (selectedStatus !== 'All') {
      matchesStatus = c.status === selectedStatus;
    }

    return matchesSearch && matchesCountry && matchesStatus && matchesGrade;
  });

  // Sort inventory: newest created/arriving first (descending)
  const sorted = [...filtered].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.arrivalDate || 0).getTime();
    const timeB = new Date(b.createdAt || b.arrivalDate || 0).getTime();
    return timeB - timeA;
  });

  const uniqueCountries = ['All', ...Array.from(new Set(containers.map(c => c.countryName)))];

  return (
    <div className="p-6 sm:p-8 md:p-10 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-200 dark:border-zinc-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Timber Inventory Ledger</h1>
          <p className="text-xs text-stone-500 dark:text-zinc-450 mt-0.5">
            Manage logs specifications, vessel shipping arrivals, and yard allocations.
          </p>
        </div>
        <Link
          href="/admin/inventory/add"
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-850 text-zinc-100 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400 text-xs font-semibold rounded-xl tracking-wider uppercase transition-all shadow-sm cursor-pointer"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Add New Container</span>
        </Link>
      </div>

      {/* Filter Matrix HUD */}
      <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900/60 grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-1">
          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Search Serial</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search container ID..."
            className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/45"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Filter Origin</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950/45 cursor-pointer"
          >
            {uniqueCountries.map(co => (
              <option key={co} value={co}>{co}</option>
            ))}
          </select>
        </div>

        {/* Grade */}
        <div>
          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Filter Grade</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950/45 cursor-pointer"
          >
            <option value="All">All Grades</option>
            <option value="FEQ">FEQ (First Export)</option>
            <option value="Grade A">Grade A</option>
            <option value="Grade B">Grade B</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Filter Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950/45 cursor-pointer font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Drafts">Drafts Only (Hidden)</option>
            <option value="Published">Published Live</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>

      </div>

      {/* Main Ledger Table */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900/60 shadow-sm">
        <table className="min-w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-400 border-b border-stone-200 dark:bg-zinc-950 dark:border-zinc-900 uppercase font-bold tracking-wider text-[10px]">
              <th className="px-6 py-4">Container ID</th>
              <th className="px-6 py-4">Origin</th>
              <th className="px-6 py-4">Grade</th>
              <th className="px-6 py-4">Vol (CFT)</th>
              <th className="px-6 py-4">Logs Count</th>
              <th className="px-6 py-4">Avg Specs</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150 dark:divide-zinc-800">
            {loading ? (
              [1, 2].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="px-6 py-6 h-12 bg-stone-100/50 dark:bg-zinc-900/50" />
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-stone-400">
                  No cargo files registered matching selections.
                </td>
              </tr>
            ) : (
              sorted.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-950/30 transition-colors">
                  <td className="px-6 py-4 font-semibold flex items-center gap-2">
                    <span>{item.container_number}</span>
                    {item.isDraft && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-500/20 text-amber-600 border border-amber-500/30 dark:text-amber-400">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="mr-1.5">{item.countryFlag}</span>
                    <span>{item.countryName}</span>
                  </td>
                  <td className="px-6 py-4">{item.grade}</td>
                  <td className="px-6 py-4 font-semibold">{item.cft} CFT</td>
                  <td className="px-6 py-4">{item.logsCount} logs</td>
                  <td className="px-6 py-4 text-stone-500 dark:text-zinc-450">
                    L: {item.avgLength}ft | G: {item.avgDiameter}cm
                  </td>
                  <td className="px-6 py-4">
                    {item.isDraft ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400">
                        Draft Lock
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        item.status === 'available' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        item.status === 'reserved' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                    {/* 1-Click Publish Logs Button for Drafts */}
                    {item.isDraft && (
                      <button
                        type="button"
                        onClick={() => handlePublish(item.id)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] uppercase rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        title="Publish logs live to public website"
                      >
                        <Globe className="h-3 w-3" />
                        <span>Publish Logs</span>
                      </button>
                    )}

                    {/* View Public */}
                    {!item.isDraft && (
                      <a 
                        href={`/stock/${item.container_number}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 dark:hover:bg-zinc-800"
                        title="Preview public profile"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {/* Duplicate */}
                    <button 
                      onClick={() => handleDuplicate(item)}
                      className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-650 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Duplicate record template"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {/* Edit */}
                    <Link 
                      href={`/admin/inventory/edit/${item.id}`}
                      className="p-1.5 rounded hover:bg-stone-100 text-amber-600 hover:text-amber-500 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Edit specs"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    {/* Delete */}
                    <button 
                      onClick={() => setDeleteTargetId(item.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                      title="Remove record"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-3 text-red-500">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold tracking-tight">Delete Container Record?</h3>
              </div>

              <p className="text-xs text-stone-500 dark:text-zinc-405 leading-relaxed">
                Are you sure you want to delete container record <strong className="text-stone-900 dark:text-white">{deleteTargetId}</strong>? This action will immediately unpublish it from the public stock catalog. This cannot be undone.
              </p>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold uppercase tracking-wider dark:border-zinc-800 dark:hover:bg-zinc-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="w-1/2 py-2.5 bg-red-650 hover:bg-red-600 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
