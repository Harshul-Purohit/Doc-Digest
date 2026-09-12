'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-purple-radial bg-purple-grid px-6 py-12 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl text-center glow-purple">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Something went wrong
        </h2>

        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          {error.message || 'An unexpected application error occurred.'}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-500/40 focus:outline-none cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:bg-zinc-700 hover:text-white"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
