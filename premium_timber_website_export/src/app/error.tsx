'use client';

import React, { useEffect } from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics service (e.g. Sentry/LogRocket in production)
    console.error('Interrupted error boundary:', error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg p-6 text-center space-y-8">
        
        {/* Error icon header */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            System Error Intercepted
          </h1>
          <p className="text-stone-500 dark:text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
            A client-side execution disruption occurred. Our team has been notified of the digest crash logs.
          </p>
          {error.digest && (
            <code className="inline-block bg-stone-100 border border-stone-200 text-[10px] px-2.5 py-1 rounded font-mono text-stone-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
              ERR_DIGEST: {error.digest}
            </code>
          )}
        </div>

        {/* Retry / Return actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recover Session</span>
          </button>
          
          <a
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
