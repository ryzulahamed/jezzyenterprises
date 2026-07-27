'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { inventoryService } from '../../../services/inventoryService';
import { 
  Database, 
  Layers, 
  MapPin, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight,
  Anchor
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  
  // States
  const [containers, setContainers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cData = await inventoryService.getContainers();
        setContainers(cData);
        
        const iData = await inventoryService.getInquiries();
        setInquiries(iData);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute metrics
  const totalContainers = containers.length;
  const availableCount = containers.filter(c => c.status === 'available').length;
  const reservedCount = containers.filter(c => c.status === 'reserved').length;
  const soldCount = containers.filter(c => c.status === 'sold').length;
  const uniqueCountries = new Set(containers.map(c => c.countryName)).size;
  const totalInquiries = inquiries.length;
  const totalCft = containers.reduce((acc, c) => acc + c.cft, 0);

  // Take 3 recently added published logs
  const recentLogs = [...containers]
    .sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime())
    .slice(0, 3);

  // Group counts for charts
  const countryCounts = containers.reduce((acc: Record<string, number>, curr) => {
    acc[curr.countryName] = (acc[curr.countryName] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 md:p-10 space-y-8 select-none">
      
      {/* Header HUD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-200 dark:border-zinc-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-stone-500 dark:text-zinc-450 mt-0.5">
            Tuticorin yard stats, imports log tracking, and CRM inquiries overview.
          </p>
        </div>
        <Link
          href="/admin/inventory/add"
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-850 text-zinc-100 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400 text-xs font-semibold rounded-xl tracking-wider uppercase transition-all shadow-sm group"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Add Container</span>
        </Link>
      </div>

      {/* Statistics Cards Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total CFT Volume */}
        <div className="p-5 rounded-3xl liquid-glass spatial-card liquid-glow flex flex-col justify-between h-28 cursor-pointer">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Stock volume</span>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">{totalCft.toLocaleString()} CFT</h3>
            <p className="text-[9px] text-stone-400 dark:text-zinc-550 mt-0.5">{totalContainers} Containers Arrived</p>
          </div>
        </div>

        {/* Available Containers */}
        <div className="p-5 rounded-3xl liquid-glass spatial-card liquid-glow flex flex-col justify-between h-28 cursor-pointer">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Available Stock</span>
            <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{availableCount} Containers</h3>
            <p className="text-[9px] text-stone-400 dark:text-zinc-550 mt-0.5">{reservedCount} Reserved | {soldCount} Sold</p>
          </div>
        </div>

        {/* Countries imported */}
        <div className="p-5 rounded-3xl liquid-glass spatial-card liquid-glow flex flex-col justify-between h-28 cursor-pointer">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Origins Active</span>
            <MapPin className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">{uniqueCountries} Regions</h3>
            <p className="text-[9px] text-stone-400 dark:text-zinc-550 mt-0.5">Direct vessel pipelines</p>
          </div>
        </div>

        {/* Customer Inquiries */}
        <div className="p-5 rounded-3xl liquid-glass spatial-card liquid-glow flex flex-col justify-between h-28 cursor-pointer">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Dealer Inquiries</span>
            <MessageSquare className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">{totalInquiries} Records</h3>
            <p className="text-[9px] text-stone-400 dark:text-zinc-550 mt-0.5">{inquiries.filter(i => i.status === 'new').length} Unhandled requests</p>
          </div>
        </div>

      </div>

      {/* SVG Interactive Analytics Charts (x: 2cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Chart 1: Stock by Country Donut (x: 5cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900/60 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Stock Distribution</h3>
          
          <div className="flex justify-center items-center h-48 relative">
            {/* Simple Gorgeous Custom SVG Donut Chart */}
            <svg viewBox="0 0 100 100" className="w-36 h-36">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#27272a" strokeWidth="8" />
              {/* Ecuador Segment */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="9" strokeDasharray="251.2" strokeDashoffset="60" />
              {/* Brazil Segment */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="9" strokeDasharray="251.2" strokeDashoffset="140" />
              {/* Panama Segment */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="9" strokeDasharray="251.2" strokeDashoffset="210" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{totalContainers}</span>
              <span className="text-[8px] uppercase tracking-widest text-stone-400 font-bold">Containers</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 text-[9px] uppercase tracking-wider font-semibold text-stone-500">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="h-2 w-2 rounded bg-amber-500" />
              <span>Ecuador</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="h-2 w-2 rounded bg-green-500" />
              <span>Brazil</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="h-2 w-2 rounded bg-blue-500" />
              <span>Other</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Arrivals Bar Chart (x: 7cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900/60 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Monthly Arrivals (Seeded)</h3>
            <span className="text-[10px] text-stone-400 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              <span>+15% Growth</span>
            </span>
          </div>

          <div className="h-44 flex items-end justify-between pt-6 border-b border-stone-100 dark:border-zinc-800 text-[10px] uppercase font-bold text-stone-400">
            {/* March Bar */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-8 bg-stone-200 dark:bg-zinc-800 rounded-t-md h-12" />
              <span>Mar</span>
            </div>
            {/* April Bar */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-8 bg-stone-200 dark:bg-zinc-800 rounded-t-md h-24" />
              <span>Apr</span>
            </div>
            {/* May Bar */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-8 bg-stone-200 dark:bg-zinc-800 rounded-t-md h-16" />
              <span>May</span>
            </div>
            {/* June Bar */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-8 bg-amber-500 rounded-t-md h-36 animate-pulse" />
              <span className="text-amber-500">Jun</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: CRM Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Col 1: Recently Added Containers */}
        <div className="p-6 rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900/60 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <Anchor className="h-4 w-4 text-amber-500" />
              <span>Recently Arrived Cargo</span>
            </h3>
            <Link href="/admin/inventory" className="text-[10px] text-amber-600 hover:underline dark:text-amber-500 uppercase tracking-widest font-semibold flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex justify-between items-center text-xs p-3 rounded-xl border border-stone-50 bg-stone-50/20 dark:border-zinc-850 dark:bg-zinc-950/20">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{log.countryFlag}</span>
                  <div>
                    <p className="font-semibold">{log.container_number}</p>
                    <p className="text-[10px] text-stone-400 dark:text-zinc-550 mt-0.5">{log.cft} CFT | {log.logsCount} logs</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-zinc-900`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Recent Inquiries Feed */}
        <div className="p-6 rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900/60 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Recent Inquiries</span>
            </h3>
            <Link href="/admin/inquiries" className="text-[10px] text-amber-600 hover:underline dark:text-amber-500 uppercase tracking-widest font-semibold flex items-center gap-0.5">
              <span>Respond</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {inquiries.slice(0, 3).map((inq) => (
              <div key={inq.id} className="flex justify-between items-center text-xs p-3 rounded-xl border border-stone-50 bg-stone-50/20 dark:border-zinc-850 dark:bg-zinc-950/20">
                <div>
                  <p className="font-semibold">{inq.customerName}</p>
                  <p className="text-[10px] text-stone-400 dark:text-zinc-550 mt-0.5">
                    {inq.companyName || 'Private Builder'} — <span className="text-amber-500">{inq.city}</span>
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-stone-400 uppercase">
                  {inq.containerId}
                </span>
              </div>
            ))}
            {inquiries.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-6">No pending customer inquiries.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
