'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Activity, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const { login, loading } = useAuth();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation / Error handling
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Simple validation
    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    try {
      await login(email, password, rememberMe);
    } catch (err: any) {
      setValidationError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500">
      {/* Background visual design */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[120px] dark:bg-amber-500/5" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-stone-400/20 blur-[120px] dark:bg-zinc-800/15" />
      </div>

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8">
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-500 text-zinc-950 shadow-lg dark:bg-amber-500 dark:text-zinc-950 mb-3"
          >
            {/* Minimal luxurious wood ring */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3"/>
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl sm:text-2xl font-semibold tracking-tight text-center"
          >
            Timber Import & Export
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1"
          >
            Administrative Console
          </motion.p>
        </div>

        {/* Card Panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-2xl border border-stone-200/60 bg-white/70 p-6 sm:p-8 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/65"
        >
          <h2 className="text-lg font-medium mb-5">Sign In</h2>
          
          {validationError && (
            <div className="mb-4 text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {validationError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
            {/* Decoy hidden inputs to prevent browser autofill */}
            <input type="text" style={{ display: 'none' }} name="prevent_autofill_email" tabIndex={-1} />
            <input type="password" style={{ display: 'none' }} name="prevent_autofill_pass" tabIndex={-1} />

            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400 dark:text-zinc-500" />
                <input
                  type="text"
                  name="admin_username_user"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400 dark:text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="admin_password_user"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5 text-stone-400 dark:text-zinc-500" />
                  ) : (
                    <Eye className="h-4.5 w-4.5 text-stone-400 dark:text-zinc-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500/30 dark:border-zinc-800"
              />
              <label htmlFor="remember-me" className="ml-2 text-xs text-stone-500 dark:text-zinc-400 cursor-pointer select-none">
                Keep me signed in for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all disabled:opacity-50 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400 cursor-pointer shadow-sm"
            >
              {loading ? (
                <Activity className="h-4 w-4 animate-spin text-current" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Back Link to Website */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          >
            ← Return to public website
          </a>
        </div>
      </div>
    </div>
  );
}
