'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Clock, MapPin, Send, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { inventoryService } from '../../services/inventoryService';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: '',
    message: '',
    containerId: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [containers, setContainers] = useState<any[]>([]);

  const [settings, setSettings] = useState({
    brandName: 'Jezzy Enterprises',
    whatsapp: '+91 94437 14496',
    email: 'jezzyenterprises@hotmail.com',
    location: '3608/26, Dandapani Puram 2nd street, Pudukkottai - 622001'
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
          email: parsed.email || prev.email,
          location: parsed.location || prev.location
        }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const list = await inventoryService.getContainers();
        const available = list.filter((c: any) => c.status === 'available');
        setContainers(available);
      } catch (err) {
        console.error('Error fetching containers:', err);
      }
    };
    fetchContainers();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const preselect = params.get('container') || params.get('containerId');
      if (preselect) {
        setFormData(prev => ({ ...prev, containerId: preselect }));
      }
    }
  }, [containers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate database insertion (under LocalStorage or Supabase)
    setTimeout(() => {
      // Fetch existing inquiries or initialize empty list
      const existingStr = localStorage.getItem('timber_mock_inquiries') || '[]';
      const existing = JSON.parse(existingStr);
      
      const newInquiry = {
        id: `inq-${Date.now()}`,
        customerName: formData.name,
        companyName: formData.company,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        message: formData.message,
        containerId: formData.containerId || 'General Inquiry',
        status: 'new',
        date: new Date().toISOString()
      };

      existing.push(newInquiry);
      localStorage.setItem('timber_mock_inquiries', JSON.stringify(existing));
      
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', company: '', phone: '', email: '', city: '', message: '', containerId: '' });
    }, 1200);
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Col 1: Contact Details & Map (x: 5cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                Get In Touch
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display">
                Contact Our {settings.brandName} Office
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-450 leading-relaxed">
                Connect with our grading and import sales team to request price quotations, custom length specifications, or reserve arriving cargo.
              </p>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-stone-500 dark:text-zinc-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900 dark:text-zinc-100">Headquarters</p>
                  <p className="mt-0.5 text-stone-500 dark:text-zinc-450">{settings.location}, Tamilnadu, India</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900 dark:text-zinc-100">Import Inquiries</p>
                  <p className="mt-0.5 text-stone-500 dark:text-zinc-450">{settings.whatsapp} (Sales Office)</p>
                  <p className="text-[10px] text-stone-400 dark:text-zinc-500">WhatsApp support available on same number</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900 dark:text-zinc-100">Email Address</p>
                  <p className="mt-0.5 text-stone-500 dark:text-zinc-450">{settings.email}</p>
                </div>
              </li>
            </ul>

            {/* Premium Simulated Map block */}
            <div className="h-48 w-full rounded-2xl overflow-hidden border border-stone-200 bg-white relative dark:border-zinc-900 dark:bg-zinc-900/60 shadow-sm flex flex-col justify-between p-6 select-none">
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Google Maps Navigation</span>
                <h4 className="text-sm font-semibold">Taj Timbers (Regional Office)</h4>
                <p className="text-[11px] text-stone-500 dark:text-zinc-455 max-w-xs">Located at Dandapani Puram 2nd street. Easily accessible for logistics and clients.</p>
              </div>
              <div className="absolute right-4 bottom-4 z-10">
                <a
                  href="https://maps.app.goo.gl/AV1WsYSMJ1Ctnmnm9?g_st=ac"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-stone-900 text-stone-100 hover:bg-stone-850 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-[10px] tracking-wider uppercase font-semibold rounded-xl transition-all shadow-sm block text-center"
                >
                  Open Navigation
                </a>
              </div>
              
              {/* Abstract decorative grid for map feel */}
              <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none">
                <div className="absolute h-full w-full bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
              </div>
            </div>
          </div>

          {/* Col 2: Enquiry Form (x: 7cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900 shadow-lg">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span>Submit Sourcing Inquiry</span>
              </h3>

              {submitted ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="inline-flex h-12 w-12 rounded-full bg-green-500/10 text-green-500 items-center justify-center border border-green-500/20">
                    <Send className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-semibold">Inquiry Dispatched</h4>
                  <p className="text-xs text-stone-500 dark:text-zinc-455 max-w-sm mx-auto leading-relaxed">
                    Thank you. Your bulk wood requirements have been registered. Our Tuticorin yard logistics desk will call you back within 1 business day.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2 border border-stone-200 hover:bg-stone-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-colors text-xs font-semibold rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Send Another Request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Sundar Raj"
                        className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g., Coimbatore Timber Mart"
                        className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Phone Number *
                      </label>
                       <input
                         type="tel"
                         required
                         value={formData.phone}
                         onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                         placeholder="e.g., 9443714496"
                         pattern="[0-9]{10}"
                         maxLength={10}
                         title="Please enter exactly 10 digits mobile number"
                         className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                       />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g., purchase@timber.com"
                        className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                      Destination City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Pudukkottai, Coimbatore, Chennai"
                      className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                      Select Container of Interest
                    </label>
                    <select
                      value={formData.containerId}
                      onChange={(e) => setFormData({ ...formData, containerId: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 cursor-pointer font-semibold text-stone-850 dark:text-zinc-200"
                    >
                      <option value="">-- General / Custom Sourcing Inquiry --</option>
                      {containers.map((c) => (
                        <option key={c.container_number} value={c.container_number}>
                          {c.container_number} - {c.species} ({c.grade} | {c.cft} CFT | {c.warehouse})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                      Inquiry Details & Species / Size Requirements *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="e.g., Looking to procure 2,000 CFT of 20ft length Ecuadorian Teak round logs for high-end furniture manufacturing."
                      className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-zinc-900 text-stone-100 btn-light-up dark:bg-amber-500 dark:text-zinc-950 text-xs font-semibold tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Submit Sourcing Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
