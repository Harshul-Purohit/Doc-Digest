import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface SummarySkeletonProps {
  statusText?: string;
}

export function SummarySkeleton({ statusText = 'Processing webpage content...' }: SummarySkeletonProps) {
  return (
    <div className="w-full rounded-2xl border border-violet-500/20 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-xl animate-pulse sm:p-8">
      {/* Top Status Badge Header */}
      <div className="mb-6 flex items-center justify-between border-b border-violet-500/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400">
            <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 animate-bounce text-fuchsia-400" />
              <span>DocDigest AI Engine</span>
            </p>
            <p className="text-sm font-medium text-zinc-300">{statusText}</p>
          </div>
        </div>
        <div className="h-6 w-20 rounded-full bg-violet-500/15" />
      </div>

      {/* Title & Meta Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-3/4 rounded-lg bg-violet-500/20" />
        <div className="h-4 w-1/3 rounded-md bg-zinc-800/80" />
      </div>

      {/* Executive TL;DR Skeleton Box */}
      <div className="mt-6 rounded-xl border border-violet-500/15 bg-violet-950/20 p-4 space-y-2">
        <div className="h-5 w-28 rounded bg-violet-500/30" />
        <div className="h-4 w-full rounded bg-zinc-800/60" />
        <div className="h-4 w-5/6 rounded bg-zinc-800/60" />
      </div>

      {/* Bullet Items Skeleton */}
      <div className="mt-6 space-y-4">
        <div className="h-6 w-40 rounded bg-violet-500/25" />
        <div className="space-y-3 pl-2">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-violet-400" />
            <div className="h-4 w-full rounded bg-zinc-800/60" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-violet-400" />
            <div className="h-4 w-4/5 rounded bg-zinc-800/60" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-violet-400" />
            <div className="h-4 w-11/12 rounded bg-zinc-800/60" />
          </div>
        </div>
      </div>

      {/* Deep Breakdown Skeleton Block */}
      <div className="mt-8 space-y-3">
        <div className="h-6 w-52 rounded bg-violet-500/25" />
        <div className="h-4 w-full rounded bg-zinc-800/50" />
        <div className="h-4 w-full rounded bg-zinc-800/50" />
        <div className="h-4 w-2/3 rounded bg-zinc-800/50" />
      </div>
    </div>
  );
}
