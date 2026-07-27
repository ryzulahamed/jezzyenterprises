'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Lock, Phone, Mail, Building, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Verification security wall states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [enteredVerificationCode, setEnteredVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showSimulatedEmailBanner, setShowSimulatedEmailBanner] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    brandName: 'Jezzy Enterprises',
    whatsapp: '+91 94437 14496',
    email: 'jezzyenterprises@hotmail.com',
    location: '3608/26, Dandapani Puram 2nd street, Pudukkottai - 622001',
    password: '',
    confirmPassword: ''
  });

  const [adminEmail, setAdminEmail] = useState('ryzulahamed@gmail.com');

  // Load configuration from local storage on mount
  useEffect(() => {
    // Load configuration from local storage on mount
    const savedEmail = localStorage.getItem('timber_custom_admin_email');
    if (savedEmail) {
      setAdminEmail(savedEmail);
    } else if (user?.email) {
      setAdminEmail(user.email);
    }

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

    // Save Admin Login Email
    if (adminEmail.trim()) {
      const cleanEmail = adminEmail.trim().toLowerCase();
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.auth.updateUser({ email: cleanEmail });
          if (error) throw new Error(error.message);
        } catch (err: any) {
          setErrorMsg(err.message || 'Failed to update admin login email in database.');
          return;
        }
      } else {
        const oldEmail = localStorage.getItem('timber_custom_admin_email') || user?.email || 'ryzulahamed@gmail.com';
        if (cleanEmail !== oldEmail.toLowerCase()) {
          localStorage.setItem('timber_custom_admin_email', cleanEmail);
          const customPass = localStorage.getItem(`timber_custom_password_${oldEmail.toLowerCase()}`);
          if (customPass) {
            localStorage.setItem(`timber_custom_password_${cleanEmail}`, customPass);
          }
        }
      }
    }

    // Handle Password Update if filled
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('New passwords do not match!');
        return;
      }
      
      // TRIGGER THE SECURITY WALL:
      // Generate 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setPendingPassword(formData.password);
      setShowVerificationModal(true);
      setVerificationError(null);
      setEnteredVerificationCode('');
      
      // Show simulated notification box (in-app test sandbox)
      setShowSimulatedEmailBanner(true);
      return; // Wait for modal verification
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    
    // Dispatch custom storage event so other elements on the page update in real-time
    window.dispatchEvent(new Event('storage'));
  };

  const handleVerifyAndSavePassword = async () => {
    setVerificationError(null);
    if (enteredVerificationCode !== generatedCode) {
      setVerificationError('Invalid verification code. Please try again.');
      return;
    }

    setModalLoading(true);
    try {
      await authService.updatePassword(pendingPassword);
      
      // Close modal
      setShowVerificationModal(false);
      setShowSimulatedEmailBanner(false);
      
      // Show success state
      setSuccess(true);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setTimeout(() => setSuccess(false), 3000);
      
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to update administrative password.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 select-none max-w-4xl relative">
      
      {/* Simulated Email Verification Overlay Box */}
      {showSimulatedEmailBanner && (
        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10 text-stone-850 dark:text-zinc-100 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold uppercase text-[9px] tracking-wider text-amber-600 dark:text-amber-500">📧 Outbox Mail Simulator</span>
            <button 
              type="button"
              onClick={() => setShowSimulatedEmailBanner(false)}
              className="text-stone-400 hover:text-stone-600 font-bold"
            >
              Dismiss
            </button>
          </div>
          <p className="leading-relaxed">
            Sent secure verification code to <strong className="text-stone-950 dark:text-white">{adminEmail}</strong>:
          </p>
          <div className="flex items-center gap-3 bg-stone-100 dark:bg-zinc-950 p-2.5 rounded-xl border border-stone-200 dark:border-zinc-850 font-mono text-sm w-fit font-bold">
            Code: {generatedCode}
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-xs text-stone-500 dark:text-zinc-450 mt-1">Configure brand settings, global WhatsApp contacts, and credentials profile parameters.</p>
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
            <h3 className="text-xs font-bold uppercase tracking-wider">Business profile</h3>
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

        {/* Security Password Card */}
        <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 bg-white dark:border-zinc-900 dark:bg-zinc-900/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
            <Lock className="h-4.5 w-4.5 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Security Access</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Admin Login Email Address</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="e.g. ryzulahamed@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40 text-stone-855 dark:text-zinc-200 font-semibold"
              />
              <p className="text-[9px] text-stone-400 dark:text-zinc-500">This email address will receive password reset instructions and security codes.</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
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
            <span>Save configuration</span>
          </button>
        </div>

      </form>

      {/* Verification Code modal backdrop */}
      <AnimatePresence>
        {showVerificationModal && (
          <div className="fixed inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xl space-y-4 text-xs"
            >
              <div className="flex items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
                <Lock className="h-4.5 w-4.5 text-red-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-zinc-100">Identity Security Wall</h3>
              </div>

              <div className="space-y-1.5 text-stone-500 dark:text-zinc-450 leading-normal">
                <p>
                  To change your administrative credentials, please authorize this update. A verification code has been dispatched to:
                </p>
                <p className="font-extrabold text-stone-900 dark:text-white bg-stone-50 dark:bg-zinc-950 px-2 py-1 rounded text-center border border-stone-100 dark:border-zinc-850">
                  {adminEmail}
                </p>
              </div>

              {verificationError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/15 text-red-600 dark:text-red-400 font-semibold leading-normal">
                  {verificationError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest">Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={enteredVerificationCode}
                  onChange={(e) => setEnteredVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full px-3 py-2 border border-stone-200 bg-stone-50/50 rounded-xl text-center font-mono text-sm tracking-widest focus:border-amber-500 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950/40 text-stone-850 dark:text-zinc-150"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setShowSimulatedEmailBanner(false);
                  }}
                  className="w-1/2 py-2 border border-stone-200 hover:bg-stone-50 dark:border-zinc-800 dark:hover:bg-zinc-850 font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyAndSavePassword}
                  disabled={modalLoading || enteredVerificationCode.length !== 6}
                  className="w-1/2 py-2 bg-red-600 hover:bg-red-750 text-white font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  {modalLoading ? 'Saving...' : 'Verify & Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
