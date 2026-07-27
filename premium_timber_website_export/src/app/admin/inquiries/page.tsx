'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../../services/inventoryService';
import { Search, MessageSquare, Phone, Mail, Clock, Calendar, CheckCircle, RefreshCw, Trash2, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCustomDelete, setShowCustomDelete] = useState(false);
  const [customDeleteDate, setCustomDeleteDate] = useState('');
  const [modalData, setModalData] = useState({
    customerName: '',
    companyName: '',
    phone: '',
    email: '',
    city: '',
    message: '',
    containerId: ''
  });

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getInquiries();
      // Artificial delay (600ms) for visual feedback so spinner rotates tactilely
      await new Promise((resolve) => setTimeout(resolve, 600));
      setInquiries(data);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContainers = async () => {
    try {
      const list = await inventoryService.getContainers();
      setContainers(list.filter((c: any) => c.status === 'available'));
    } catch (err) {
      console.error('Error fetching containers:', err);
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchContainers();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await inventoryService.updateInquiryStatus(id, newStatus);
      // Refresh local state list
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
    } catch (err) {
      console.error('Error updating inquiry status:', err);
    }
  };

  const handleDeleteInquiry = (id: string) => {
    if (!confirm('Are you sure you want to delete this customer inquiry? This action cannot be undone.')) return;
    try {
      const existingStr = localStorage.getItem('timber_mock_inquiries') || '[]';
      const existing = JSON.parse(existingStr);
      const updated = existing.filter((inq: any) => inq.id !== id);
      localStorage.setItem('timber_mock_inquiries', JSON.stringify(updated));
      setInquiries(updated);
    } catch (err) {
      console.error('Error deleting inquiry:', err);
    }
  };

  const handleBulkDelete = (threshold: string) => {
    let confirmMsg = 'Are you sure you want to delete ';
    if (threshold === 'all') {
      confirmMsg += 'ALL customer inquiries?';
    } else {
      confirmMsg += `customer inquiries older than ${threshold} days?`;
    }
    
    if (!confirm(confirmMsg + ' This action cannot be undone.')) return;
    
    try {
      const existingStr = localStorage.getItem('timber_mock_inquiries') || '[]';
      const existing = JSON.parse(existingStr);
      
      if (threshold === 'all') {
        localStorage.setItem('timber_mock_inquiries', '[]');
        setInquiries([]);
        alert('All inquiries cleared successfully.');
        return;
      }
      
      const limitDays = parseInt(threshold, 10);
      const now = new Date().getTime();
      const limitTime = limitDays * 24 * 60 * 60 * 1000;
      
      const updated = existing.filter((inq: any) => {
        const inqTime = inq.date ? new Date(inq.date).getTime() : now;
        const age = now - inqTime;
        return age < limitTime; // Keep if age is less than the limit threshold
      });
      
      localStorage.setItem('timber_mock_inquiries', JSON.stringify(updated));
      setInquiries(updated);
      alert(`Deleted ${existing.length - updated.length} older inquiries successfully.`);
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

    if (!confirm(`Are you sure you want to delete all inquiry logs older than ${new Date(selectedDate).toLocaleDateString()}? This action cannot be undone.`)) return;

    try {
      const existingStr = localStorage.getItem('timber_mock_inquiries') || '[]';
      const existing = JSON.parse(existingStr);
      
      const updated = existing.filter((inq: any) => {
        const inqTime = inq.date ? new Date(inq.date).getTime() : 0;
        return inqTime >= cutoffTime;
      });

      localStorage.setItem('timber_mock_inquiries', JSON.stringify(updated));
      setInquiries(updated);
      alert(`Deleted ${existing.length - updated.length} older inquiries successfully.`);
      setShowCustomDelete(false);
      setCustomDeleteDate('');
    } catch (err) {
      console.error('Error executing custom bulk delete:', err);
    }
  };

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newInq = {
      id: `inq-${Date.now()}`,
      customerName: modalData.customerName,
      companyName: modalData.companyName,
      phone: modalData.phone,
      email: modalData.email,
      city: modalData.city,
      message: modalData.message,
      containerId: modalData.containerId || 'General Inquiry',
      status: 'new',
      date: new Date().toISOString()
    };
    
    try {
      const existingStr = localStorage.getItem('timber_mock_inquiries') || '[]';
      const existing = JSON.parse(existingStr);
      existing.push(newInq);
      localStorage.setItem('timber_mock_inquiries', JSON.stringify(existing));
      
      // Refresh list
      setInquiries(existing);
      
      // Close modal & reset form
      setIsModalOpen(false);
      setModalData({
        customerName: '',
        companyName: '',
        phone: '',
        email: '',
        city: '',
        message: '',
        containerId: ''
      });
    } catch (err) {
      console.error('Error creating manual inquiry:', err);
    }
  };

  // Filter inquiries
  const filtered = inquiries.filter(inq => {
    const nameVal = inq.name || inq.customerName || '';
    const matchesSearch = 
      nameVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort inquiries: newest first (descending)
  const sorted = [...filtered].sort((a, b) => {
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
  });

  return (
    <div className="space-y-6 select-none relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Customer Inquiries</h1>
          <p className="text-xs text-stone-500 dark:text-zinc-450 mt-1">Manage bulk sourcing requests, customer messages, and WhatsApp communications.</p>
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
            <option value="1">Older than 24 Hours</option>
            <option value="7">Older than 7 Days</option>
            <option value="30">Older than 30 Days</option>
            <option value="custom">📅 Custom Date Cutoff...</option>
            <option value="all">Delete All Inquiries</option>
          </select>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 border border-emerald-500 rounded-xl text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:border-emerald-950/45 dark:bg-emerald-950/20 dark:text-emerald-400 hover:bg-emerald-500/15 cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Inquiry</span>
          </button>

          <button 
            onClick={() => fetchInquiries()}
            className="flex items-center gap-2 px-3 py-1.5 border border-stone-200 rounded-xl text-xs font-semibold uppercase tracking-wider bg-white dark:border-zinc-800 dark:bg-zinc-950/40 hover:bg-stone-50 cursor-pointer transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
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

      {/* Filters Panel */}
      <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inquiries by name, contact details, or keyword..."
            className="w-full pl-10 pr-4 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/45 placeholder-stone-400"
          />
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/45 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="new">New Inquiries</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

      </div>

      {/* inquiries Cards / List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-stone-200/50 dark:bg-zinc-900/50 animate-pulse border border-stone-200/40 dark:border-zinc-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-stone-200/80 bg-white dark:border-zinc-900 dark:bg-zinc-900/50">
          <MessageSquare className="h-8 w-8 text-stone-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-350">No customer inquiries found</h3>
          <p className="text-[10px] text-stone-400 dark:text-zinc-550 mt-1">Inquiries submitted via public channels or manual logs will load here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sorted.map((item) => (
            <motion.div
              layout
              key={item.id}
              className="p-5 sm:p-6 border border-stone-200/90 rounded-2xl bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900/50 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Badge status corner */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-stone-900 dark:text-zinc-100 font-display">
                      {item.customerName || item.name}
                    </h3>
                    {item.companyName || item.company ? (
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">
                        • {item.companyName || item.company}
                      </span>
                    ) : null}
                  </div>
                  
                  {/* City */}
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mt-0.5">
                    📍 {item.city}
                  </span>
                </div>
                
                {/* Status select drop */}
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full cursor-pointer focus:outline-none border ${
                    item.status === 'new'
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/25 dark:bg-blue-500/20 dark:text-blue-400'
                      : item.status === 'in_progress'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/25 dark:bg-amber-500/20 dark:text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-400'
                  }`}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Inquiry target metadata */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-stone-500 dark:text-zinc-400 border-t border-b border-stone-100 dark:border-zinc-800/80 py-3">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-stone-400" />
                  <span>{item.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-stone-400" />
                  <span className="truncate">{item.email}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 mt-1">
                  <Calendar className="h-3.5 w-3.5 text-stone-400" />
                  <span>
                    Logged: {new Date(item.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>
                
                <div className="col-span-2 flex items-center gap-1.5 mt-1 bg-stone-50 dark:bg-zinc-950/40 p-2 rounded-xl border border-stone-100 dark:border-zinc-850/60">
                  <span className="font-bold uppercase tracking-wider text-[8px] px-1.5 py-0.5 rounded bg-zinc-900 text-stone-100 dark:bg-zinc-100 dark:text-zinc-950">Container Interest</span>
                  <span className="font-mono text-[9.5px] font-bold text-stone-750 dark:text-zinc-300 truncate">
                    {item.containerId}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-4 rounded-xl bg-stone-100/60 dark:bg-zinc-950/70 border border-stone-200/60 dark:border-zinc-850 text-xs text-stone-950 dark:text-zinc-50 leading-relaxed font-semibold">
                {item.message}
              </div>

              {/* Action Channels */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => handleDeleteInquiry(item.id)}
                  className="px-3.5 py-2 border border-red-500/15 bg-red-500/5 hover:bg-red-650 hover:text-white dark:border-red-950 dark:bg-red-950/15 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
                <a
                  href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(item.name || item.customerName)},%20this%20is%20Jezzy%20Enterprises%20regarding%20your%20timber%20sourcing%20inquiry.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500 hover:text-zinc-950 text-amber-600 dark:text-amber-400 dark:hover:text-zinc-950 text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Start WhatsApp Chat</span>
                </a>
              </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* Manual Inquiry Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-6 relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="border-b border-stone-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-emerald-500" />
                <span>Create Manual Sourcing Inquiry</span>
              </h3>
              <p className="text-[10px] text-stone-500 dark:text-zinc-400 mt-1">
                Log inquiries directly on behalf of dealers and dealers.
              </p>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Customer Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={modalData.customerName}
                    onChange={(e) => setModalData({...modalData, customerName: e.target.value})}
                    className="w-full px-3 py-1.5 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Company Name</label>
                  <input 
                    type="text" 
                    value={modalData.companyName}
                    onChange={(e) => setModalData({...modalData, companyName: e.target.value})}
                    className="w-full px-3 py-1.5 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Phone Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={modalData.phone}
                    onChange={(e) => setModalData({...modalData, phone: e.target.value.replace(/\D/g, '')})}
                    placeholder="e.g., 9443714496"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    title="Please enter exactly 10 digits mobile number"
                    className="w-full px-3 py-1.5 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    value={modalData.email}
                    onChange={(e) => setModalData({...modalData, email: e.target.value})}
                    className="w-full px-3 py-1.5 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Destination City *</label>
                  <input 
                    type="text" 
                    required 
                    value={modalData.city}
                    onChange={(e) => setModalData({...modalData, city: e.target.value})}
                    className="w-full px-3 py-1.5 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Container of Interest</label>
                  <select 
                    value={modalData.containerId}
                    onChange={(e) => setModalData({...modalData, containerId: e.target.value})}
                    className="w-full px-3 py-1.5 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/40"
                  >
                    <option value="">-- General Sourcing --</option>
                    {containers.map((c) => (
                      <option key={c.container_number} value={c.container_number}>
                        {c.container_number} ({c.species})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Inquiry details & size requirements *</label>
                <textarea 
                  required 
                  rows={3} 
                  value={modalData.message}
                  onChange={(e) => setModalData({...modalData, message: e.target.value})}
                  className="w-full px-3 py-1.5 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950/40 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 dark:border-zinc-800 text-xs font-semibold rounded-xl uppercase tracking-wider cursor-pointer hover:bg-stone-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl uppercase tracking-wider cursor-pointer hover:bg-emerald-500"
                >
                  Log Inquiry
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
