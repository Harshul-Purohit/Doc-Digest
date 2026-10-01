'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Link2,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Zap,
  ExternalLink,
  Loader2,
  X,
  History,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { RichTextSummary } from '@/components/RichTextSummary';
import { SummarySkeleton } from '@/components/SummarySkeleton';
import { VantaWavesBackground } from '@/components/VantaWavesBackground';
import { HistoryDrawer, HistoryItem } from '@/components/HistoryDrawer';
import { isValidUrl } from '@/lib/scraper';

const EXAMPLE_URLS = [
  {
    name: 'Next.js App Router Docs',
    url: 'https://nextjs.org/docs/app',
  },
  {
    name: 'React 19 Overview',
    url: 'https://react.dev/blog/2024/04/25/react-19',
  },
  {
    name: 'Cheerio Parsing Guide',
    url: 'https://cheerio.js.org',
  },
];

interface UsageInfo {
  count: number;
  limit: number | string;
  remaining: number | string;
  role?: string;
}

interface UserState {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [user, setUser] = useState<UserState | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      }
    } catch (err) {
      console.error('Failed to fetch user state:', err);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data: UsageInfo = await response.json();
        setUsage(data);
      }
    } catch (err) {
      console.error('Failed to fetch usage info:', err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchUsage();
  }, []);

  const isLimitReached =
    usage !== null &&
    usage.role !== 'admin' &&
    typeof usage.remaining === 'number' &&
    usage.remaining === 0;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      fetchUsage();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDigest = async (targetUrl: string) => {
    const trimmedUrl = targetUrl.trim();
    if (!trimmedUrl) {
      setError('Please enter a web page URL.');
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setError('Please provide a valid HTTP or HTTPS URL (e.g., https://example.com).');
      return;
    }

    if (isLimitReached) {
      setError('Free generation limit reached (3/3 for today). Reset at midnight UTC.');
      return;
    }

    setError(null);
    setSummary('');
    setIsLoading(true);
    setStatusText('Fetching webpage...');

    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate summary.';
        try {
          const errData = await response.json();
          if (errData.error) {
            errorMessage = errData.error;
          }
        } catch {
          errorMessage = `Server error returned status code ${response.status}.`;
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('No stream body available from the server response.');
      }

      setStatusText('Synthesizing with Gemini...');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let firstChunkReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (!firstChunkReceived) {
          firstChunkReceived = true;
          setStatusText('Streaming response...');
          summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        const chunk = decoder.decode(value, { stream: true });
        setSummary((prev) => prev + chunk);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setStatusText('');
      fetchUsage();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDigest(url);
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleClear = () => {
    setUrl('');
    setSummary('');
    setError(null);
    setIsLoading(false);
    setStatusText('');
  };

  const handleSelectHistorySummary = (historyItem: HistoryItem) => {
    setUrl(historyItem.url);
    setSummary(historyItem.summary);
    setError(null);
    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-zinc-100 relative z-10">
      {/* 3D Vanta Waves Background Layer */}
      <VantaWavesBackground />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSummary={handleSelectHistorySummary}
        isAuthenticated={Boolean(user)}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-violet-500/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-500 shadow-lg shadow-violet-600/30 ring-1 ring-white/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Doc<span className="text-violet-400">Digest</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Usage Status Badge */}
            {usage !== null && (
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold backdrop-blur-md transition-all ${
                  usage.role === 'admin'
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-sm'
                    : isLimitReached
                    ? 'border border-amber-500/30 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/10 animate-pulse'
                    : 'border border-purple-500/25 bg-purple-500/10 text-purple-300 shadow-sm'
                }`}
              >
                <Zap
                  className={`h-3.5 w-3.5 ${
                    usage.role === 'admin'
                      ? 'text-emerald-400'
                      : isLimitReached
                      ? 'text-amber-400'
                      : 'text-purple-400'
                  }`}
                />
                <span>
                  {usage.role === 'admin' ? (
                    <strong className="font-bold">Unlimited (Admin)</strong>
                  ) : (
                    <>
                      Generations:{' '}
                      <strong className="font-bold">{usage.remaining}/3 left today</strong>
                    </>
                  )}
                </span>
              </div>
            )}

            {/* History Drawer Toggle Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 hover:text-white transition-all backdrop-blur-md"
            >
              <History className="h-3.5 w-3.5 text-violet-400" />
              <span>History</span>
            </button>

            {/* Auth Action Buttons / User Badge */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-300">
                  <UserIcon className="h-3.5 w-3.5 text-violet-400" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white shadow-md shadow-violet-600/30 hover:from-violet-500 hover:to-purple-500 transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pt-16 pb-20">
        <div className="mx-auto max-w-4xl">
          {/* Brand Heading & Product Summary */}
          <div className="text-center max-w-3xl mx-auto mb-10 pt-4 space-y-4 relative z-20">
            {/* Main Brand Title */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
              Doc<span className="text-violet-400">Digest</span>
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-xl font-medium text-violet-300 tracking-wide">
              Clarity for complex documentation.
            </p>

            {/* How It Works & What It Does Section */}
            <div className="pt-2 max-w-2xl mx-auto space-y-2">
              <span className="inline-block text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 shadow-sm">
                How It Works & What It Does
              </span>
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-normal">
                Modern technical writing is scattered across complex site structures and endless tabs. DocDigest condenses exhaustive documentation, technical blogs, and guides into single-glance digests—distilling long reads into clear explanations, implementation patterns, and core takeaways.
              </p>
            </div>
          </div>

          {/* Interactive URL Input Bar (Semi-translucent with dynamic Vanta background visible) */}
          <form onSubmit={handleSubmit} className="mt-10">
            <div className="group relative rounded-2xl border border-violet-500/20 bg-[#130b2c]/40 p-2 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-violet-500/40 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/40 glow-purple">
              <div className="flex items-center gap-3 px-3">
                <Link2 className="h-5 w-5 shrink-0 text-violet-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={
                    isLimitReached
                      ? 'Free daily limit reached (0/3 left today). Reset at midnight UTC.'
                      : 'Paste documentation URL (e.g., https://nextjs.org/docs/app)'
                  }
                  className="w-full bg-transparent py-3 text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isLimitReached}
                />
                {url && !isLoading && !isLimitReached && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="p-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !url.trim() || isLimitReached}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Digest Link</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Upgrade / Limit Reached Banner */}
          {isLimitReached && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-center backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  Free daily limit reached (3/3 used today). Reset at midnight UTC or sign in as admin for unlimited access.
                </span>
              </div>
            </div>
          )}

          {/* Quick Preset Example URL Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-500">Try an example:</span>
            {EXAMPLE_URLS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setUrl(item.url);
                  handleDigest(item.url);
                }}
                disabled={isLoading || isLimitReached}
                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/15 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-300 transition-all hover:border-violet-500/40 hover:bg-violet-950/40 hover:text-violet-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{item.name}</span>
                <ExternalLink className="h-3 w-3 text-violet-400" />
              </button>
            ))}
          </div>

          {/* Error Alert Card */}
          {error && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-950/20 p-5 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-red-500/20 p-2 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-200">Processing Failed</h3>
                  <p className="mt-1 text-sm text-red-300/90 leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="rounded-lg p-1 text-red-400 hover:bg-red-900/40 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Summary Display Area */}
          <div className="mt-10" ref={summaryRef}>
            {isLoading && !summary && (
              <SummarySkeleton statusText={statusText} />
            )}

            {(summary || (isLoading && summary)) && (
              <div className="relative rounded-2xl border border-violet-500/25 bg-zinc-900/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8 glow-purple">
                {/* Action Controls Bar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-violet-500/15 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                      {isLoading ? statusText || 'Streaming Summary...' : 'Executive Digest Complete'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!summary}
                      className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-200 transition-all hover:bg-violet-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Markdown</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleClear}
                      className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-700 hover:text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Rendered Summary Component */}
                <RichTextSummary content={summary} />

                {/* Real-time streaming cursor indicator */}
                {isLoading && (
                  <span className="inline-block h-4 w-2 ml-1 bg-violet-400 animate-pulse rounded-sm" />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
