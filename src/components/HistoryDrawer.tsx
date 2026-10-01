'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  History,
  ExternalLink,
  Clock,
  Search,
  FileText,
  Loader2,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  createdAt: string;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSummary: (summaryItem: HistoryItem) => void;
  isAuthenticated: boolean;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  onSelectSummary,
  isAuthenticated,
}: HistoryDrawerProps) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchHistory();
    }
  }, [isOpen, isAuthenticated]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data.summaries || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to load history.');
      }
    } catch {
      setError('Network error loading history.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = historyItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-violet-500/20 bg-[#130b2c]/95 text-zinc-100 shadow-2xl backdrop-blur-2xl">
          <div className="flex h-full flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-violet-500/15 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/25">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Digest History</h2>
                  <p className="text-xs text-zinc-400">
                    Your previously generated briefs
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 hover:bg-violet-500/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Area */}
            {!isAuthenticated ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20 mb-4">
                  <LogIn className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-white">Sign In Required</h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-xs">
                  Create an account or sign in to save your history and access your past document digests anytime.
                </p>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-purple-500 transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In / Create Account</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-violet-500/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-violet-500/20 bg-zinc-900/60 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                      <span className="text-xs">Loading history...</span>
                    </div>
                  ) : error ? (
                    <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-xs text-red-300">
                      {error}
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 gap-2">
                      <FileText className="h-10 w-10 text-zinc-600" />
                      <p className="text-xs font-medium text-zinc-400">
                        {searchQuery ? 'No matching summaries found' : 'No saved digests yet'}
                      </p>
                      <p className="text-[11px] text-zinc-500 max-w-xs">
                        {searchQuery
                          ? 'Try searching with a different keyword.'
                          : 'Summarize a document URL on the homepage to save it here.'}
                      </p>
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectSummary(item);
                          onClose();
                        }}
                        className="group cursor-pointer rounded-xl border border-violet-500/15 bg-zinc-900/40 p-4 transition-all hover:border-violet-500/40 hover:bg-violet-950/30"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-white group-hover:text-violet-300 line-clamp-2 transition-colors">
                            {item.title}
                          </h4>
                          <span className="shrink-0 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500 truncate font-mono">
                          {item.url}
                        </p>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <Clock className="h-3 w-3 text-violet-400" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
