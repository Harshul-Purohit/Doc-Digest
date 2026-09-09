'use client';

import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Sparkles,
  Link2,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  FileText,
  Zap,
  ShieldCheck,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import { RichTextSummary } from '@/components/RichTextSummary';
import { SummarySkeleton } from '@/components/SummarySkeleton';
import { isValidUrl } from '@/lib/scraper';

const EXAMPLE_URLS = [
  {
    name: 'Next.js App Routing',
    url: 'https://nextjs.org/docs/app/building-your-application/routing',
  },
  {
    name: 'React 19 Overview',
    url: 'https://react.dev/blog/2024/04/25/react-19',
  },
  {
    name: 'Tailwind CSS v4.0',
    url: 'https://tailwindcss.com/blog/tailwindcss-v4',
  },
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);

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

    setError(null);
    setSummary('');
    setIsLoading(true);
    setStatusText('Fetching webpage...');

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
        }

        const chunk = decoder.decode(value, { stream: true });
        setSummary((prev) => prev + chunk);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setStatusText('');
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

  return (
    <div className="flex min-h-screen flex-col bg-purple-radial bg-purple-grid text-zinc-100">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-violet-500/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-500 shadow-lg shadow-violet-600/30 ring-1 ring-white/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Doc<span className="text-violet-400">Digest</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-400 animate-pulse" />
              <span>AI Web Digest</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pt-12 pb-20">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-tight">
              Transform Dense Web Content into{' '}
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
                Structured Technical Briefs
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
              DocDigest scrapes web pages, documentation, and technical articles to stream executive summaries, key takeaways, and architecture breakdowns in real time.
            </p>
          </div>

          {/* Interactive URL Input Bar */}
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="group relative rounded-2xl border border-violet-500/20 bg-zinc-900/80 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-violet-500/40 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/40 glow-purple">
              <div className="flex items-center gap-3 px-3">
                <Link2 className="h-5 w-5 shrink-0 text-violet-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste URL (e.g., https://docs.nextjs.org/...)"
                  className="w-full bg-transparent py-3 text-sm text-white placeholder-zinc-500 focus:outline-none"
                  disabled={isLoading}
                />
                {url && !isLoading && (
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
                  disabled={isLoading || !url.trim()}
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

          {/* Quick Preset Example URL Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-500">Try an example:</span>
            {EXAMPLE_URLS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setUrl(item.url);
                  handleDigest(item.url);
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/15 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-300 transition-all hover:border-violet-500/40 hover:bg-violet-950/40 hover:text-violet-300 disabled:opacity-50"
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
          <div className="mt-10">
            {isLoading && !summary && (
              <SummarySkeleton statusText={statusText} />
            )}

            {(summary || (isLoading && summary)) && (
              <div
                ref={summaryRef}
                className="relative rounded-2xl border border-violet-500/25 bg-zinc-900/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8 glow-purple"
              >
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
                      className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-200 transition-all hover:bg-violet-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Summary</span>
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

            {/* Default State Feature Cards */}
            {!isLoading && !summary && !error && (
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-violet-500/15 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all hover:border-violet-500/30 hover:bg-zinc-900/70">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">Scrape & Clean</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    Strips navigation bars, footers, scripts, and layout noise automatically, leaving pure technical content.
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-500/15 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all hover:border-violet-500/30 hover:bg-zinc-900/70">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">Real-Time Streaming</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    Streams text chunks immediately via Google Gemini 2.5 Flash without waiting for the full response.
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-500/15 bg-zinc-900/40 p-6 backdrop-blur-sm transition-all hover:border-violet-500/30 hover:bg-zinc-900/70">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-400 ring-1 ring-fuchsia-500/20">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">GFM Markdown Output</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    Generates executive TL;DRs, key takeaways, architectural details, and code blocks in clean GitHub-Flavored Markdown.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-500/10 bg-zinc-950/80 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <p>© {new Date().getFullYear()} DocDigest. Web Digesting powered by Google Gemini.</p>
          <div className="flex gap-4">
            <span className="text-violet-400 font-mono">Next.js App Router</span>
            <span>•</span>
            <span className="text-purple-400 font-mono">Cheerio Web Scraper</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
