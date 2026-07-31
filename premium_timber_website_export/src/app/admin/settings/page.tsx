'use client';

import React, { useState, useEffect } from 'react';
import { Save, Building, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brandName: 'Jezzy Enterprises',
    whatsapp: '+91 94437 14496',
    email: 'jezzyenterprises@hotmail.com',
    location: '3608/26, Dandapani Puram 2nd street, Pudukkottai - 622001'
  });

  // Load configuration from local storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('timber_system_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          brandName: parsed.brandName || prev.brandName,
          whatsapp: parsed.whatsapp || prev.whatsapp,
          email: parsed.email || prev.email,
          location: parsed.location || prev.location
        }));
      } catch (err) {
        console.error('Error parsing settings:', err);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccess(false);

    // Save Business Settings
    const businessSettings = {
      brandName: formData.brandName,
      whatsapp: formData.whatsapp,
      email: formData.email,
      location: formData.location
    };
    localStorage.setItem('timber_system_settings', JSON.stringify(businessSettings));

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);

    // Dispatch custom storage event so other elements update in real-time
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-6 select-none max-w-4xl relative">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-xs text-stone-500 dark:text-zinc-450 mt-1">Configure brand settings, global WhatsApp contacts, and business profile parameters.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Success badge */}
        {success && (
          <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Settings profiles updated successfully! Changes are applied globally.</span>
          </div>
        )}

        {/* Profile Error badge */}
        {errorMsg && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Global Branding Card */}
        <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
            <Building className="h-4.5 w-4.5 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Business Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Company Brand Name</label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">WhatsApp Contact Number</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Global Sales Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Primary Location Address</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
              />
            </div>

          </div>
        </div>

        {/* Form controls */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-zinc-900 text-stone-100 hover:bg-zinc-850 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>
    </div>
  );
}
