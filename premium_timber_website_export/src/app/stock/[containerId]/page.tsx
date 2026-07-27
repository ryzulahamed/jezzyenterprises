'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { inventoryService } from '../../../services/inventoryService';
import { ArrowLeft, MessageSquare, FileText, Calendar, Compass, Ruler, Scale, Eye, ShieldCheck, Mail, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const containerId = params.containerId as string;

  const [container, setContainer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Image focus state
  const [activeImg, setActiveImg] = useState('');
  const [bookingInfo, setBookingInfo] = useState<any | null>(null);

  // Dynamic system branding configuration
  const [settings, setSettings] = useState({
    brandName: 'Jezzy Enterprises',
    whatsapp: '+91 94437 14496',
    email: 'jezzyenterprises@hotmail.com'
  });

  useEffect(() => {
    const saved = localStorage.getItem('timber_system_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({
          ...prev,
          brandName: parsed.brandName || prev.brandName,
          whatsapp: parsed.whatsapp || prev.whatsapp,
          email: parsed.email || prev.email
        }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Inquiry Modal state
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    company: '',
    phone: '',
    city: '',
    email: '',
    message: ''
  });

  const [draftItem, setDraftItem] = useState<any | null>(null);

  useEffect(() => {
    const fetchContainer = async () => {
      try {
        const item = await inventoryService.getContainerById(containerId);
        if (item) {
          if (item.isDraft) {
            setDraftItem(item);
          } else {
            setContainer(item);
            setActiveImg(item.images?.[0] || 'https://images.unsplash.com/photo-1546482502-0dfb4398c88f?auto=format&fit=crop&w=800&q=80');
            
            // Check if this container is booked
            const reservations = await inventoryService.getReservations();
            const activeRes = (reservations || []).find(
              (r: any) => r.containerId === item.id && (r.status === 'approved' || r.status === 'pending')
            );
            if (activeRes) {
              setBookingInfo(activeRes);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContainer();
  }, [containerId]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save locally
    const existingStr = localStorage.getItem('timber_mock_inquiries') || '[]';
    const existing = JSON.parse(existingStr);
    const newInquiry = {
      id: `inq-${Date.now()}`,
      customerName: inquiryForm.name,
      companyName: inquiryForm.company,
      phone: inquiryForm.phone,
      email: inquiryForm.email,
      city: inquiryForm.city,
      containerId: container.container_number,
      message: inquiryForm.message || '',
      status: 'new',
      date: new Date().toISOString()
    };
    existing.push(newInquiry);
    localStorage.setItem('timber_mock_inquiries', JSON.stringify(existing));

    let createdRes: any = null;
    const cleanMsg = (inquiryForm.message || '').toLowerCase();
    // Also auto insert a reservation record if the user states booking intent
    if (cleanMsg.includes('reserve') || cleanMsg.includes('book')) {
      const existingResStr = localStorage.getItem('timber_mock_reservations') || '[]';
      const existingRes = JSON.parse(existingResStr);
      createdRes = {
        id: `res-${Date.now()}`,
        containerId: container.id || container.container_number,
        customerName: inquiryForm.name,
        companyName: inquiryForm.company,
        phone: inquiryForm.phone,
        email: inquiryForm.email,
        city: inquiryForm.city,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      existingRes.push(createdRes);
      localStorage.setItem('timber_mock_reservations', JSON.stringify(existingRes));
      setBookingInfo(createdRes);
    }

    // Compile WhatsApp parameters
    const cleanPhone = settings.whatsapp.replace(/\D/g, '') || '919443714496';
    const whatsappPhone = cleanPhone;
    const textMessage = `Hello ${settings.brandName},
I would like to submit a timber sourcing inquiry for:
- Container ID: ${container.container_number}
- Origin: ${container.countryName}
- Species: ${container.species}
- Volume: ${container.cft} CFT (${container.logsCount} logs)
- Specifications: L: ${container.avgLength}ft | Girth: ${container.avgDiameter}cm

My Details:
- Name: ${inquiryForm.name}
- Company: ${inquiryForm.company}
- Email: ${inquiryForm.email}
- City: ${inquiryForm.city}
- Phone: ${inquiryForm.phone}
- Notes: ${inquiryForm.message || 'N/A'}`;

    const encodedText = encodeURIComponent(textMessage);
    const waUrl = `https://wa.me/${whatsappPhone}?text=${encodedText}`;
    
    // Close modal & redirect directly to WhatsApp (bypassing popup blockers)
    setInquiryModalOpen(false);
    if (typeof window !== 'undefined') {
      window.location.href = waUrl;
    }
  };

  const handlePrintPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!container) {
    if (draftItem) {
      return (
        <>
          <Navbar />
          <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
            <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              📌 Container Saved as Draft Lock
            </div>
            <h2 className="text-xl font-bold">Container "{draftItem.container_number}" is Hidden</h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-md leading-relaxed">
              This container is currently saved as a <strong>Draft</strong> in your Admin Ledger. Public buyers cannot see or access it until you click <strong>"Publish Logs"</strong>.
            </p>
            <div className="flex gap-3 pt-2">
              <Link
                href={`/admin/inventory/edit/${draftItem.id || draftItem.container_number}`}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Edit & Publish in Admin
              </Link>
              <button onClick={() => router.push('/stock')} className="px-5 py-2.5 border border-stone-300 dark:border-zinc-800 rounded-xl text-xs font-semibold uppercase tracking-wider">
                Return to Stock Catalog
              </button>
            </div>
          </div>
          <Footer />
        </>
      );
    }

    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none">
          <h2 className="text-xl font-bold mb-2">Specifications Profile Missing</h2>
          <p className="text-xs text-stone-500 max-w-sm mb-6">The requested cargo file is either sold, archived, or undergoing port inspection revisions.</p>
          <button onClick={() => router.push('/stock')} className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider">
            Return to stock
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500 pt-28 pb-20 select-none print:pt-0 print:pb-0 print:bg-white print:text-black">
        <div className="max-w-7xl mx-auto px-6 space-y-10 print:px-0">
          
          {/* Back button */}
          <button
            onClick={() => router.push('/stock')}
            className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors text-xs font-semibold uppercase tracking-wider print:hidden cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Stock Catalog</span>
          </button>

          {/* Product Hero Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: Gallery Panel (x: 7cols) */}
            <div className="lg:col-span-7 space-y-4 print:hidden">
              <div className="h-96 sm:h-[480px] w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-zinc-900 bg-white">
                <img src={activeImg} alt={container.container_number} className="h-full w-full object-cover" />
              </div>

              {/* Thumbnails */}
              {container.images && container.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-1 max-w-full">
                  {container.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(img)}
                      className={`h-16 w-24 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        activeImg === img ? 'border-amber-500 scale-102 ring-1 ring-amber-500/20' : 'border-stone-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Spec preview" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Specifications Card HUD (x: 5cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900 shadow-lg space-y-6 print:border-none print:shadow-none print:p-0 print:col-span-12">
              
              {/* Header Title */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-500">
                    Container Spec Sheet
                  </span>
                  <span className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                    bookingInfo
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-550/15 dark:text-amber-400'
                      : 'bg-stone-100 border-stone-250 dark:bg-zinc-950 dark:border-zinc-800'
                  }`}>
                    {bookingInfo ? 'Reserved' : container.status}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                  <span>{container.countryFlag}</span>
                  <span>{container.container_number}</span>
                </h1>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  {container.species} round logs harvested in certified plantations.
                </p>
              </div>

              {/* Core Specifications Matrix */}
              <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-stone-150 dark:border-zinc-800/80 text-xs">
                
                {/* Origin */}
                <div className="flex items-start gap-2.5">
                  <Compass className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400">Origin Country</p>
                    <p className="font-semibold mt-0.5">{container.countryName}</p>
                  </div>
                </div>

                {/* Volume */}
                <div className="flex items-start gap-2.5">
                  <Scale className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400">Total Volume</p>
                    <p className="font-semibold mt-0.5">
                      {container.cft} CFT ({(() => {
                        if (container.cbm !== undefined && container.cbm !== null && container.cbm !== '') {
                          if (typeof container.cbm === 'number') return container.cbm.toFixed(3);
                          const str = container.cbm.toString().trim();
                          const num = parseFloat(str);
                          if (!isNaN(num) && !str.includes('-')) return num.toFixed(3);
                          return str;
                        }
                        if (container.cft !== undefined && container.cft !== null && container.cft !== '') {
                          const num = typeof container.cft === 'number' ? container.cft : parseFloat(container.cft);
                          if (!isNaN(num)) return (num / 35.3147).toFixed(3);
                        }
                        return '0.000';
                      })()} CBM)
                    </p>
                  </div>
                </div>

                {/* Rate per CFT */}
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400">Rate per CFT</p>
                    <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {(() => {
                        if (!container.ratePerCft) return 'Contact Sales';
                        const str = container.ratePerCft.toString().trim();
                        if (str.includes('-')) return `₹${str}`;
                        const num = parseFloat(str);
                        return isNaN(num) ? `₹${str}` : `₹${num.toLocaleString('en-IN')}`;
                      })()}
                    </p>
                  </div>
                </div>

                {/* Log count */}
                <div className="flex items-start gap-2.5">
                  <FileText className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400">Total Log Count</p>
                    <p className="font-semibold mt-0.5">{container.logsCount} Logs</p>
                  </div>
                </div>

                {/* Quality Grade */}
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400">Quality Grade</p>
                    <p className="font-semibold mt-0.5">{container.grade}</p>
                  </div>
                </div>

                {/* Length */}
                <div className="flex items-start gap-2.5">
                  <Ruler className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400">Length</p>
                    <p className="font-semibold mt-0.5">{container.avgLength} {container.lengthUnit || 'ft'}</p>
                  </div>
                </div>

                {/* Girth */}
                <div className="flex items-start gap-2.5">
                  <Eye className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400">Girth</p>
                    <p className="font-semibold mt-0.5">{container.avgDiameter} {container.girthUnit || 'cm'}</p>
                  </div>
                </div>

                {/* Storage Yard Location */}
                <div className="flex items-start gap-2.5 col-span-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
                  <MapPin className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400">Storage Yard Location</p>
                    <p className="font-semibold mt-0.5 text-amber-600 dark:text-amber-400">
                      {container.warehouse || 'Tuticorin Port Transit Yard'}
                    </p>
                  </div>
                </div>

                {/* Moisture */}


                {/* Arrival Date */}
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400">
                      {new Date(container.arrivalDate).getTime() <= new Date().setHours(0,0,0,0) ? 'Arrived Port' : 'Arrival Date'}
                    </p>
                    <p className="font-semibold mt-0.5">{container.arrivalDate}</p>
                  </div>
                </div>

              </div>

              {/* Description */}
              <div className="space-y-2 text-xs leading-relaxed text-stone-500 dark:text-zinc-400">
                <p className="font-semibold text-stone-700 dark:text-zinc-350">Description Profile</p>
                <p>{container.description}</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 pt-4 print:hidden">
                {container.status !== 'sold' && container.status !== 'reserved' ? (
                  <>
                    <button
                      onClick={() => setInquiryModalOpen(true)}
                      className="w-full py-3 bg-zinc-900 text-stone-100 dark:bg-amber-500 dark:text-zinc-950 text-xs font-bold tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 btn-light-up shadow-md cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{bookingInfo ? 'Send WhatsApp Message' : 'Submit WhatsApp Booking'}</span>
                    </button>

                    <button
                      onClick={handlePrintPdf}
                      className="w-full py-3 border border-stone-200 text-stone-700 font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 btn-light-up dark:border-zinc-800 dark:text-zinc-200 shadow-sm cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-amber-500" />
                      <span>Generate Specification PDF</span>
                    </button>
                  </>
                ) : (
                  <div className="p-4 rounded-xl text-center bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 font-bold uppercase tracking-wider text-xs shadow-sm">
                    {container.status === 'sold' ? '🚫 Container Sold' : '🔒 Container Reserved'}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {inquiryModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-2xl space-y-6"
            >
              <div className="space-y-1.5">
                <h3 className="text-base font-bold tracking-tight">Confirm WhatsApp Booking</h3>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400">Collects customer details to format and pre-fill your WhatsApp message template.</p>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    placeholder="e.g., Sundar Raj"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={inquiryForm.company}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, company: e.target.value })}
                    placeholder="e.g., Saraswathi Wood Works"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    placeholder="e.g., sundar@timber.com"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g., 9443714496"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      title="Please enter exactly 10 digits mobile number"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.city}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, city: e.target.value })}
                      placeholder="e.g., Coimbatore"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Message / Custom Lengths</label>
                  <textarea
                    rows={3}
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setInquiryModalOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold uppercase tracking-wider transition-colors dark:border-zinc-800 dark:hover:bg-zinc-850 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Launch WhatsApp
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
