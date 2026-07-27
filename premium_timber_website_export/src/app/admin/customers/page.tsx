'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../../services/inventoryService';
import { Search, Users, ExternalLink, Calendar, Clock, MessageSquare, Briefcase, Mail, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomDelete, setShowCustomDelete] = useState(false);
  const [customDeleteDate, setCustomDeleteDate] = useState('');

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      // Build customers ledger dynamically from inquiries + reservations mock data
      const inquiries = await inventoryService.getInquiries();
      const reservations = await inventoryService.getReservations();

      const customerMap: Record<string, any> = {};

      const getCustomerKey = (email: string, phone: string) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
        
        // Find existing record by matching email or phone
        const existingKey = Object.keys(customerMap).find(k => {
          const c = customerMap[k];
          const matchEmail = cleanEmail && (c.email || '').toLowerCase() === cleanEmail;
          const matchPhone = cleanPhone && (c.phone || '').replace(/[^0-9]/g, '') === cleanPhone;
          return matchEmail || matchPhone;
        });
        
        return existingKey || cleanEmail || cleanPhone;
      };

      // Parse inquiries
      (inquiries || []).forEach(inq => {
        if (!inq) return;
        const key = getCustomerKey(inq.email, inq.phone);
        if (!key) return;
        
        if (!customerMap[key]) {
          customerMap[key] = {
            name: inq.name || inq.customerName || 'Anonymous Client',
            email: inq.email || 'N/A',
            phone: inq.phone || '',
            city: inq.city || 'Unknown',
            inquiriesCount: 0,
            reservationsCount: 0,
            lastActive: inq.date || new Date().toISOString().split('T')[0]
          };
        }
        customerMap[key].inquiriesCount += 1;
        
        const inqTime = inq.date ? new Date(inq.date).getTime() : 0;
        const lastActiveTime = customerMap[key].lastActive ? new Date(customerMap[key].lastActive).getTime() : 0;
        if (inqTime > lastActiveTime && inq.date) {
          customerMap[key].lastActive = inq.date;
        }
      });

      // Parse reservations
      (reservations || []).forEach(res => {
        if (!res) return;
        const key = getCustomerKey(res.email, res.phone);
        if (!key) return;
        
        if (!customerMap[key]) {
          customerMap[key] = {
            name: res.customerName || 'Anonymous Client',
            email: res.email || 'N/A',
            phone: res.phone || '',
            city: res.city || 'Tamil Nadu',
            inquiriesCount: 0,
            reservationsCount: 0,
            lastActive: res.date || new Date().toISOString().split('T')[0]
          };
        } else {
          // Merge details
          const c = customerMap[key];
          if (res.customerName && (!c.name || c.name === 'Anonymous Client')) {
            c.name = res.customerName;
          }
          if (res.email && (!c.email || c.email === 'N/A' || c.email === 'inquiry@form.com')) {
            c.email = res.email;
          }
          if (res.city && (!c.city || c.city === 'Unknown')) {
            c.city = res.city;
          }
        }
        
        customerMap[key].reservationsCount += 1;
        
        const resTime = res.date ? new Date(res.date).getTime() : 0;
        const lastActiveTime = customerMap[key].lastActive ? new Date(customerMap[key].lastActive).getTime() : 0;
        if (resTime > lastActiveTime && res.date) {
          customerMap[key].lastActive = res.date;
        }
      });

      setCustomers(Object.values(customerMap));
    } catch (err) {
      console.error('Error generating customer list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = (email: string, phone: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}" and all their associated inquiry and reservation logs? This action cannot be undone.`)) return;
    
    try {
      // Clear inquiries
      const inqStr = localStorage.getItem('timber_mock_inquiries') || '[]';
      const inquiries = JSON.parse(inqStr);
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
      
      const filteredInquiries = inquiries.filter((inq: any) => {
        const inqEmail = (inq.email || '').trim().toLowerCase();
        const inqPhone = (inq.phone || '').replace(/[^0-9]/g, '');
        const matchEmail = cleanEmail && inqEmail === cleanEmail;
        const matchPhone = cleanPhone && inqPhone === cleanPhone;
        return !(matchEmail || matchPhone);
      });
      localStorage.setItem('timber_mock_inquiries', JSON.stringify(filteredInquiries));

      // Clear reservations
      const resStr = localStorage.getItem('timber_mock_reservations') || '[]';
      const reservations = JSON.parse(resStr);
      const filteredReservations = reservations.filter((res: any) => {
        const resEmail = (res.email || '').trim().toLowerCase();
        const resPhone = (res.phone || '').replace(/[^0-9]/g, '');
        const matchEmail = cleanEmail && resEmail === cleanEmail;
        const matchPhone = cleanPhone && resPhone === cleanPhone;
        return !(matchEmail || matchPhone);
      });
      localStorage.setItem('timber_mock_reservations', JSON.stringify(filteredReservations));

      // Re-fetch
      fetchCRMData();
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  const handleBulkDelete = (threshold: string) => {
    let confirmMsg = 'Are you sure you want to delete ';
    if (threshold === 'all') {
      confirmMsg += 'ALL customer profile accounts and their inquiry/reservation history?';
    } else {
      confirmMsg += `customer profiles inactive for more than ${threshold} days?`;
    }
    
    if (!confirm(confirmMsg + ' This action cannot be undone.')) return;
    
    try {
      const inqStr = localStorage.getItem('timber_mock_inquiries') || '[]';
      const inquiries = JSON.parse(inqStr);
      
      const resStr = localStorage.getItem('timber_mock_reservations') || '[]';
      const reservations = JSON.parse(resStr);

      if (threshold === 'all') {
        localStorage.setItem('timber_mock_inquiries', '[]');
        localStorage.setItem('timber_mock_reservations', '[]');
        setCustomers([]);
        alert('All customer records and histories cleared.');
        return;
      }
      
      const limitDays = parseInt(threshold, 10);
      const now = new Date().getTime();
      const limitTime = limitDays * 24 * 60 * 60 * 1000;
      
      // Filter out older inquiries and reservations
      const filteredInquiries = inquiries.filter((inq: any) => {
        const inqTime = inq.date ? new Date(inq.date).getTime() : now;
        return (now - inqTime) < limitTime;
      });
      
      const filteredReservations = reservations.filter((res: any) => {
        const resTime = res.date ? new Date(res.date).getTime() : now;
        return (now - resTime) < limitTime;
      });
      
      localStorage.setItem('timber_mock_inquiries', JSON.stringify(filteredInquiries));
      localStorage.setItem('timber_mock_reservations', JSON.stringify(filteredReservations));
      
      fetchCRMData();
      alert('Older customer logs cleaned up successfully.');
    } catch (err) {
      console.error('Error executing bulk delete:', err);
    }
  };

  const handleCustomDateDelete = (selectedDate: string) => {
    if (!selectedDate) {
      alert('Please select a valid date.');
      return;
    }
    const cutoffTime = new Date(selectedDate).getTime();
    if (isNaN(cutoffTime)) {
      alert('Invalid date selected.');
      return;
    }

    if (!confirm(`Are you sure you want to delete all customer inquiry/reservation logs older than ${new Date(selectedDate).toLocaleDateString()}? This action cannot be undone.`)) return;

    try {
      const inqStr = localStorage.getItem('timber_mock_inquiries') || '[]';
      const inquiries = JSON.parse(inqStr);
      
      const resStr = localStorage.getItem('timber_mock_reservations') || '[]';
      const reservations = JSON.parse(resStr);

      const filteredInquiries = inquiries.filter((inq: any) => {
        const inqTime = inq.date ? new Date(inq.date).getTime() : 0;
        return inqTime >= cutoffTime;
      });
      
      const filteredReservations = reservations.filter((res: any) => {
        const resTime = res.date ? new Date(res.date).getTime() : 0;
        return resTime >= cutoffTime;
      });

      localStorage.setItem('timber_mock_inquiries', JSON.stringify(filteredInquiries));
      localStorage.setItem('timber_mock_reservations', JSON.stringify(filteredReservations));
      
      fetchCRMData();
      alert('Older customer logs cleaned up successfully.');
      setShowCustomDelete(false);
      setCustomDeleteDate('');
    } catch (err) {
      console.error('Error executing custom bulk delete:', err);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, []);

  const filtered = customers.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort CRM customers by last active date: newest first
  const sorted = [...filtered].sort((a, b) => {
    return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
  });

  return (
    <div className="space-y-6 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Customer CRM</h1>
          <p className="text-xs text-stone-500 dark:text-zinc-455 mt-1">Unified registry of bulk timber dealers, sawmill owners, and inquiries log history.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Bulk Delete Dropdown Filter */}
          <select
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setShowCustomDelete(true);
                e.target.value = '';
              } else if (e.target.value) {
                handleBulkDelete(e.target.value);
                e.target.value = ''; // Reset selection
              }
            }}
            defaultValue=""
            className="px-3 py-1.5 border border-red-200 rounded-xl text-xs font-semibold uppercase tracking-wider bg-red-500/5 text-red-600 dark:border-red-950/40 dark:bg-red-950/15 dark:text-red-400 cursor-pointer hover:bg-red-500/10 transition-colors focus:outline-none"
          >
            <option value="" disabled>🧹 Bulk Delete Logs</option>
            <option value="1">Inactive 24 Hours</option>
            <option value="7">Inactive 7 Days</option>
            <option value="30">Inactive 30 Days</option>
            <option value="custom">📅 Custom Date Cutoff...</option>
            <option value="all">Delete All CRM Records</option>
          </select>

          <button 
            onClick={fetchCRMData}
            className="flex items-center gap-2 px-3 py-1.5 border border-stone-200 rounded-xl text-xs font-semibold uppercase tracking-wider bg-white dark:border-zinc-800 dark:bg-zinc-950/40 hover:bg-stone-50 cursor-pointer transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync CRM</span>
          </button>
        </div>
      </div>

      {/* Custom Bulk Delete Panel */}
      {showCustomDelete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-red-200 bg-red-500/5 dark:border-red-950/40 dark:bg-red-950/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
        >
          <div className="space-y-1">
            <h4 className="font-bold text-red-700 dark:text-red-400">Custom Date Bulk Cleanup</h4>
            <p className="text-[10px] text-stone-500 dark:text-zinc-450">Select a cutoff date. All logs created BEFORE this date will be permanently deleted.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={customDeleteDate}
              onChange={(e) => setCustomDeleteDate(e.target.value)}
              className="px-3 py-1.5 border border-stone-200 rounded-xl dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:border-red-500 text-xs font-semibold text-stone-855 dark:text-zinc-200"
            />
            <button
              onClick={() => handleCustomDateDelete(customDeleteDate)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-755 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Execute Clean
            </button>
            <button
              onClick={() => {
                setShowCustomDelete(false);
                setCustomDeleteDate('');
              }}
              className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 dark:border-zinc-800 dark:hover:bg-zinc-900 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter */}
      <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900/60">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts registry by dealer name, email, phone, location..."
            className="w-full pl-10 pr-4 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950/45 placeholder-stone-400"
          />
        </div>
      </div>

      {/* CRM Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-stone-200/50 dark:bg-zinc-900/50 animate-pulse border border-stone-200/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-stone-200 p-8 dark:border-zinc-900 max-w-md mx-auto space-y-3">
          <Users className="h-10 w-10 text-stone-400 mx-auto" />
          <h3 className="font-semibold text-sm">No dealers found</h3>
          <p className="text-xs text-stone-400 dark:text-zinc-550">Dealers populate dynamically from bookings and contact sheets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.map((client, index) => (
            <motion.div
              key={`${client.email}-${client.phone}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 sm:p-6 rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900/50 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">Bulk buyer</span>
                  <h3 className="font-bold text-stone-850 dark:text-zinc-150 text-sm sm:text-base pt-1">{client.name}</h3>
                  <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold">{client.city}</p>
                </div>
                <div className="text-right text-[10px] text-stone-400 space-y-0.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span>Last Active: {client.lastActive ? new Date(client.lastActive).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* CRM Stats */}
              <div className="grid grid-cols-2 gap-3 border-t border-b border-stone-100 py-3 dark:border-zinc-800">
                <div className="text-center p-2 bg-stone-50/50 dark:bg-zinc-950/40 rounded-xl border border-stone-100/50 dark:border-zinc-850/60">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Inquiry Logs</p>
                  <p className="text-lg font-extrabold text-stone-850 dark:text-zinc-200 mt-1">{client.inquiriesCount}</p>
                </div>
                <div className="text-center p-2 bg-stone-50/50 dark:bg-zinc-950/40 rounded-xl border border-stone-100/50 dark:border-zinc-850/60">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Reservations</p>
                  <p className="text-lg font-extrabold text-amber-600 dark:text-amber-500 mt-1">{client.reservationsCount}</p>
                </div>
              </div>

              {/* Action channels */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1">
                <div className="flex flex-wrap items-center gap-4">
                  <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-stone-500 hover:text-amber-500 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-amber-500" />
                    <span>{client.phone}</span>
                  </a>
                  {client.email && client.email !== 'N/A' && (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-stone-500 hover:text-amber-500 transition-colors">
                      <Mail className="h-3.5 w-3.5 text-amber-500" />
                      <span>{client.email}</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteCustomer(client.email, client.phone, client.name)}
                  className="px-2.5 py-1 border border-red-500/15 bg-red-500/5 hover:bg-red-650 hover:text-white dark:border-red-950 dark:bg-red-950/15 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  title="Delete Customer Profile & Logs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
