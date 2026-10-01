'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  History,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { VantaWavesBackground } from '@/components/VantaWavesBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in.');
      }

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-zinc-950 text-white overflow-hidden">
      {/* Interactive Vanta Waves Background */}
      <VantaWavesBackground />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          {/* Left Side: Brand & Benefits */}
          <div className="rounded-3xl border border-violet-500/15 bg-gradient-to-br from-zinc-950/90 via-[#130b2c]/85 to-zinc-950/90 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
            <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-600/30 ring-1 ring-white/20">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Doc<span className="text-violet-400">Digest</span>
              </span>
            </Link>

            <h1 className="text-3xl font-extrabold text-white sm:text-4xl leading-tight">
              Welcome back to <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
                Developer Documentation
              </span>
            </h1>

            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
              Sign in to manage your saved digests, track daily API quotas, and access clear executive briefs instantly.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
                  <History className="h-4 w-4" />
                </div>
                <span>Save and retrieve past document digests anytime</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                  <Zap className="h-4 w-4" />
                </div>
                <span>3 daily free summaries or unlimited admin access</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/20 text-fuchsia-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span>Executive-grade technical summaries with zero fluff</span>
              </div>
            </div>
          </div>

          {/* Right Side: Auth Card */}
          <div className="rounded-3xl border border-violet-500/20 bg-[#130b2c]/60 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Sign In</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Enter your credentials to access your DocDigest account
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@example.com"
                    className="w-full rounded-xl border border-violet-500/20 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-violet-500/20 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-violet-400 hover:text-violet-300 underline underline-offset-4"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
