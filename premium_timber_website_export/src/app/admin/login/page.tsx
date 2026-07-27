'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Activity, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { isSupabaseConfigured } from '../../../services/supabaseClient';

export default function AdminLoginPage() {
  const { login, resetPassword, loading } = useAuth();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Screen state: 'login' | 'forgot' | 'reset-sent'
  const [view, setView] = useState<'login' | 'forgot' | 'reset-sent'>('login');
  
  // Validation / Error handling
  const [validationError, setValidationError] = useState<string | null>(null);

  // Mock reset simulation
  const [mockNewPassword, setMockNewPassword] = useState('');

  const handleMockPasswordResetSubmit = () => {
    if (!mockNewPassword) {
      alert('Please enter a new password.');
      return;
    }
    localStorage.setItem(`timber_custom_password_${email.toLowerCase().trim()}`, mockNewPassword);
    alert('Mock password reset successfully! You can now log in using your new password.');
    setView('login');
    setMockNewPassword('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Simple validation
    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    try {
      await login(email, password, rememberMe);
    } catch (err: any) {
      // Errors handled by AuthContext toast, but we can set form errors here
      setValidationError(err.message || 'Login failed.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email) {
      setValidationError('Please enter your registered email address.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    try {
      await resetPassword(email);
      setView('reset-sent');
    } catch (err: any) {
      setValidationError(err.message || 'Password reset request failed.');
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
            {/* Minimal luxurious wood ring / geometry representation */}
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
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div
                key="login-form"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-medium mb-5">Sign In</h2>
                
                {validationError && (
                  <div className="mb-4 text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                    {validationError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400 dark:text-zinc-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@timber.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setView('forgot')}
                        className="text-xs text-amber-600 hover:text-amber-500 hover:underline dark:text-amber-500 transition-all"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400 dark:text-zinc-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
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
            )}

            {view === 'forgot' && (
              <motion.div
                key="forgot-form"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => {
                      setView('login');
                      setValidationError(null);
                    }}
                    className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-stone-500" />
                  </button>
                  <h2 className="text-lg font-medium">Reset Password</h2>
                </div>

                <p className="text-xs text-stone-500 dark:text-zinc-400 mb-5">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>

                {validationError && (
                  <div className="mb-4 text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                    {validationError}
                  </div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-400 dark:text-zinc-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@timber.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all disabled:opacity-50 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <Activity className="h-4 w-4 animate-spin text-current" />
                    ) : (
                      <span>Send Recovery Instructions</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {view === 'reset-sent' && (
              <motion.div
                key="reset-sent-screen"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4 space-y-4"
              >
                <div>
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 mb-4">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-medium mb-2">Instructions Sent</h2>
                  <p className="text-xs text-stone-500 dark:text-zinc-400">
                    We have dispatched a password recovery link to <span className="font-semibold text-stone-900 dark:text-white">{email}</span>. Please review your spam or promotions folder if it doesn't arrive shortly.
                  </p>
                </div>

                {/* Password Reset Panel */}
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-left space-y-3.5 mt-4">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                    🔑 Instant Admin Password Reset
                  </h4>
                  <p className="text-[10.5px] text-stone-500 dark:text-zinc-400 leading-normal">
                    Enter your new password below to update your login credentials immediately:
                  </p>
                  
                  <div className="space-y-2 pt-2 border-t border-amber-500/10">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">New Password</label>
                      <input
                        type="password"
                        value={mockNewPassword}
                        onChange={(e) => setMockNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-1.5 border border-stone-200 bg-white rounded-xl text-xs focus:outline-none dark:border-zinc-850 dark:bg-zinc-950/40 text-stone-900 dark:text-zinc-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleMockPasswordResetSubmit}
                      className="w-full py-2 bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Update Password & Sign In
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setView('login');
                      setEmail('');
                      setValidationError(null);
                    }}
                    className="px-6 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-colors text-sm font-medium cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
