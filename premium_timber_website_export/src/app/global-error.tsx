'use client';

import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full min-h-screen flex items-center justify-center bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-500 font-sans">
        <div className="max-w-lg p-6 text-center space-y-8">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center animate-pulse">
              <ShieldAlert className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Critical Framework Crash
            </h1>
            <p className="text-stone-500 dark:text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
              A root layout compilation interruption was intercepted. Please recover or refresh the browser.
            </p>
            {error.digest && (
              <code className="inline-block bg-stone-100 border border-stone-200 text-[10px] px-2.5 py-1 rounded font-mono text-stone-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
                ERR_CRIT_DIGEST: {error.digest}
              </code>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Render Flow</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
