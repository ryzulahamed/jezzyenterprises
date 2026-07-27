'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../../services/inventoryService';
import { Search, CalendarDays, CheckCircle, XCircle, Clock, AlertTriangle, ExternalLink, RefreshCw, Printer, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCustomDelete, setShowCustomDelete] = useState(false);
  const [customDeleteDate, setCustomDeleteDate] = useState('');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getReservations();
      setReservations(data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await inventoryService.updateReservationStatus(id, newStatus);
      // Refresh local list
      fetchReservations();
    } catch (err) {
      console.error('Error updating reservation:', err);
    }
  };

  const handleDeleteReservation = (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation record? This action cannot be undone.')) return;
    try {
      const existingStr = localStorage.getItem('timber_mock_reservations') || '[]';
      const existing = JSON.parse(existingStr);
      const updated = existing.filter((res: any) => res.id !== id);
      localStorage.setItem('timber_mock_reservations', JSON.stringify(updated));
      setReservations(updated);
    } catch (err) {
      console.error('Error deleting reservation:', err);
    }
  };

  const handleBulkDelete = (threshold: string) => {
    let confirmMsg = 'Are you sure you want to delete ';
    if (threshold === 'all') {
      confirmMsg += 'ALL reservation logs?';
    } else {
      confirmMsg += `reservation logs older than ${threshold} days?`;
    }
    
    if (!confirm(confirmMsg + ' This action cannot be undone.')) return;
    
    try {
      const existingStr = localStorage.getItem('timber_mock_reservations') || '[]';
      const existing = JSON.parse(existingStr);
      
      if (threshold === 'all') {
        localStorage.setItem('timber_mock_reservations', '[]');
        setReservations([]);
        alert('All reservations cleared successfully.');
        return;
      }
      
      const limitDays = parseInt(threshold, 10);
      const now = new Date().getTime();
      const limitTime = limitDays * 24 * 60 * 60 * 1000;
      
      const updated = existing.filter((res: any) => {
        const resTime = res.date ? new Date(res.date).getTime() : now;
        const age = now - resTime;
        return age < limitTime;
      });
      
      localStorage.setItem('timber_mock_reservations', JSON.stringify(updated));
      setReservations(updated);
      alert(`Deleted ${existing.length - updated.length} older reservations successfully.`);
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

    if (!confirm(`Are you sure you want to delete all reservation logs older than ${new Date(selectedDate).toLocaleDateString()}? This action cannot be undone.`)) return;

    try {
      const existingStr = localStorage.getItem('timber_mock_reservations') || '[]';
      const existing = JSON.parse(existingStr);
      
      const updated = existing.filter((res: any) => {
        const resTime = res.date ? new Date(res.date).getTime() : 0;
        return resTime >= cutoffTime;
      });

      localStorage.setItem('timber_mock_reservations', JSON.stringify(updated));
      setReservations(updated);
      alert(`Deleted ${existing.length - updated.length} older reservations successfully.`);
      setShowCustomDelete(false);
      setCustomDeleteDate('');
    } catch (err) {
      console.error('Error executing custom bulk delete:', err);
    }
  };

  const handlePrintReceipt = async (booking: any) => {
    try {
      // Find the container info
      const containers = await inventoryService.getContainers();
      const container = containers.find(
        c => c.container_number === booking.containerId || c.id === booking.containerId
      );
      if (!container) {
        alert('Could not find specifications details for container: ' + booking.containerId);
        return;
      }
      
      // Open print tab with details
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      
      const receiptHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Booking Receipt - ${container.container_number}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1c1917;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #fbbf24;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .title {
              font-size: 24px;
              font-weight: 800;
              color: #d97706;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 0;
            }
            .meta-info {
              text-align: right;
              font-size: 11px;
              color: #78716c;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #78716c;
              border-bottom: 1px solid #e7e5e4;
              padding-bottom: 6px;
              margin-bottom: 15px;
            }
            .grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 20px;
            }
            .field {
              margin-bottom: 10px;
            }
            .label {
              font-size: 10px;
              font-weight: 700;
              color: #a8a29e;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .value {
              font-size: 13px;
              font-weight: 600;
              margin-top: 2px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 12px;
            }
            .table th {
              background: #f5f5f4;
              padding: 8px 12px;
              font-weight: 700;
              text-align: left;
              border-bottom: 1px solid #d6d3d1;
            }
            .table td {
              padding: 10px 12px;
              border-bottom: 1px solid #e7e5e4;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e7e5e4;
              padding-top: 20px;
              text-align: center;
              font-size: 10px;
              color: #a8a29e;
            }
            .badge {
              display: inline-block;
              background: #fef3c7;
              color: #d97706;
              border: 1px solid #fde68a;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">Jezzy Enterprises</h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #78716c; max-w: 300px;">
                3608/26, Dandapani Puram 2nd street, Pudukkottai - 622001, Tamilnadu, India
              </p>
            </div>
            <div class="meta-info">
              <p style="margin: 0; font-weight: bold; font-size: 13px;">BOOKING RECEIPT</p>
              <p style="margin: 4px 0 0 0;">Receipt No: REZ-${booking.id}</p>
              <p style="margin: 2px 0 0 0;">Date: ${booking.date}</p>
            </div>
          </div>

          <div class="section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <span class="badge">Booking status: ${booking.status}</span>
              <span style="font-size: 11px; color: #78716c;">Office Copy &bull; Confirmed Sourcing Specification</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer Details</div>
            <div class="grid">
              <div>
                <div class="field">
                  <div class="label">Contact Person</div>
                  <div class="value">${booking.customerName}</div>
                </div>
                <div class="field">
                  <div class="label">Company Name</div>
                  <div class="value">${booking.companyName || 'Individual Buyer'}</div>
                </div>
              </div>
              <div>
                <div class="field">
                  <div class="label">Phone Number</div>
                  <div class="value">${booking.phone}</div>
                </div>
                <div class="field">
                  <div class="label">Location City</div>
                  <div class="value">${booking.city || 'Tamil Nadu'}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Cargo Specifications</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Specification Item</th>
                  <th>Details / Dimensions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Container Serial ID</strong></td>
                  <td><strong>${container.container_number}</strong></td>
                </tr>
                <tr>
                  <td>Wood Species</td>
                  <td>${container.species}</td>
                </tr>
                <tr>
                  <td>Origin Country</td>
                  <td>${container.countryName}</td>
                </tr>
                <tr>
                  <td>Size Dimensions</td>
                  <td>${container.size} Cargo Container</td>
                </tr>
                <tr>
                  <td>Total Logs Count</td>
                  <td>${container.logsCount} logs</td>
                </tr>
                <tr>
                  <td>Logs Girth Range</td>
                  <td>Avg: ${container.avgDiameter} cm (Range: ${container.minDiameter} - ${container.maxDiameter} cm)</td>
                </tr>
                <tr>
                  <td>Logs Length Range</td>
                  <td>Avg: ${container.avgLength} ft (Range: ${container.minLength} - ${container.maxLength} ft)</td>
                </tr>
                <tr>
                  <td><strong>Total Volume (CFT)</strong></td>
                  <td><strong>${container.cft} CFT</strong></td>
                </tr>
                <tr>
                  <td>Quality Grade</td>
                  <td>${container.grade} Quality</td>
                </tr>
                <tr>
                  <td>Logistics Shipping Route</td>
                  <td>Load: ${container.portLoading || 'Port of Loading'} &rarr; Arrival: ${container.portArrival || 'Tuticorin Port'}</td>
                </tr>
                <tr>
                  <td>Current Yard Location</td>
                  <td>${container.warehouse || 'Tuticorin Port Transit Yard'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p style="margin: 0; font-weight: bold;">Jezzy Enterprises Timber Division</p>
            <p style="margin: 4px 0 0 0;">WhatsApp Contact Support: +91 94437 14496 | Email Support: jezzyenterprises@hotmail.com</p>
            <p style="margin: 8px 0 0 0; font-size: 8px; color: #d6d3d1;">Generated by Jezzy Enterprises portal. Subject to terms & timber load confirmations.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    } catch (e) {
      console.error(e);
      alert('Error fetching specifications to print.');
    }
  };

  // Filter list
  const filtered = reservations.filter(res => {
    const matchesSearch = 
      (res.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.containerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort reservations: newest first (descending)
  const sorted = [...filtered].sort((a, b) => {
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
  });

  return (
    <div className="space-y-6 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Cargo Reservations</h1>
          <p className="text-xs text-stone-500 dark:text-zinc-450 mt-1">Review hold requests, approve sales agreements, and manage customer container bookings.</p>
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
            <option value="all">Delete All Reservations</option>
          </select>

          <button 
            onClick={fetchReservations}
            className="flex items-center gap-2 px-3 py-1.5 border border-stone-200 rounded-xl text-xs font-semibold uppercase tracking-wider bg-white dark:border-zinc-800 dark:bg-zinc-950/40 hover:bg-stone-50 cursor-pointer transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, company, container ID..."
            className="w-full pl-10 pr-4 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950/45 placeholder-stone-400"
          />
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:outline-none focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950/45 cursor-pointer"
          >
            <option value="All">All Reservations</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

      </div>

      {/* Custom Bulk Delete Panel */}
      {showCustomDelete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-red-200 bg-red-500/5 dark:border-red-950/40 dark:bg-red-950/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs mb-4"
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

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900/60 shadow-sm">
        <table className="min-w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-400 border-b border-stone-200 dark:bg-zinc-950 dark:border-zinc-900 uppercase font-bold tracking-wider text-[10px]">
              <th className="px-6 py-4">Booking Info</th>
              <th className="px-6 py-4">Cargo ID</th>
              <th className="px-6 py-4">Customer Details</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Approve Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150 dark:divide-zinc-800">
            {loading ? (
              [1, 2].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-6 h-12 bg-stone-100/50 dark:bg-zinc-900/50" />
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                  No active container reservations match filters.
                </td>
              </tr>
            ) : (
              sorted.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-950/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-stone-850 dark:text-zinc-150">Ref: #{item.id}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{item.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/stock/${item.containerId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1 w-fit"
                    >
                      <span>{item.containerId}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="font-semibold">{item.customerName}</div>
                    {item.companyName && <div className="text-[10px] text-stone-450 dark:text-zinc-500">{item.companyName}</div>}
                    <div className="text-[10px] text-stone-400 flex gap-2">
                      <span>{item.phone}</span>
                      <span>•</span>
                      <span>{item.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      item.status === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      item.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse' :
                      'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDeleteReservation(item.id)}
                      className="px-2 py-1 border border-red-500/15 bg-red-500/5 hover:bg-red-650 hover:text-white dark:border-red-950 dark:bg-red-950/15 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                      title="Delete Reservation Log"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      onClick={() => handlePrintReceipt(item)}
                      className="px-2 py-1 border border-stone-200 hover:bg-stone-50 text-[10px] font-bold uppercase rounded-lg cursor-pointer dark:border-zinc-800 dark:hover:bg-zinc-850 transition-colors flex items-center gap-1"
                      title="Print Booking Confirmation Receipt"
                    >
                      <Printer className="h-3.5 w-3.5 text-amber-500" />
                      <span>Receipt</span>
                    </button>

                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'approved')}
                          className="px-2.5 py-1 bg-green-600 text-stone-100 hover:bg-green-500 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'rejected')}
                          className="px-2.5 py-1 border border-stone-200 hover:bg-stone-50 text-[10px] font-semibold uppercase rounded-lg cursor-pointer dark:border-zinc-800 dark:hover:bg-zinc-850 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
