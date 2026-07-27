'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { isSupabaseConfigured, supabase } from '@/services/supabaseClient';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, ShieldAlert, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function ResetPasswordCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verify that there is an active session from the password recovery redirect
  useEffect(() => {
    async function checkRecoverySession() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setHasSession(true);
          } else {
            // Check if there is an access token in the hash parameters (legacy fallback)
            const hash = typeof window !== 'undefined' ? window.location.hash : '';
            if (hash.includes('access_token=') || hash.includes('type=recovery')) {
              setHasSession(true);
            } else {
              setErrorMsg('No active recovery session found. Please request a new recovery link.');
            }
          }
        } else {
          // Mock mode: always allow simulator to load
          setHasSession(true);
        }
      } catch (err) {
        console.error('Session verify error:', err);
      } finally {
        setVerifyingSession(false);
      }
    }

    checkRecoverySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccess(false);

    if (!password) {
      setErrorMsg('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword(password);
      setSuccess(true);
      // Wait a moment and redirect to login page
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifyingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          <p className="text-xs text-stone-400">Verifying secure recovery token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500">
      {/* Abstract blurred background shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[120px] dark:bg-amber-500/5" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-stone-400/20 blur-[120px] dark:bg-zinc-800/15" />
      </div>

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-500 text-zinc-950 shadow-lg mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-center">Update Password</h1>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">Set a secure new administrative password</p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full rounded-2xl border border-stone-200/60 bg-white/70 p-6 sm:p-8 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/65"
        >
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex h-12 w-12 rounded-full bg-green-500/10 text-green-500 items-center justify-center border border-green-500/20">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-zinc-100">Password Updated</h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                Your administrative password has been reset successfully. Redirecting you to your admin dashboard...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {errorMsg && (
                <div className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl flex items-start gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {!hasSession ? (
                <div className="space-y-4 text-center">
                  <p className="text-xs text-stone-500 dark:text-zinc-450">
                    You cannot access this page directly. Please open the recovery link sent to your email or request a new one from the sign-in page.
                  </p>
                  <button
                    onClick={() => router.push('/admin/login')}
                    className="w-full py-2 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 dark:border-zinc-850 dark:hover:bg-zinc-800 transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-10 py-2.5 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 border border-stone-200 bg-stone-50/50 rounded-xl text-xs focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-zinc-800 dark:hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-current" />
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
