export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-violet-500/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-500 shadow-md shadow-violet-600/30 ring-1 ring-white/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Doc<span className="text-violet-400">Digest</span>
            </span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-violet-300"
            >
              Features
            </a>
            <a
              href="#docs"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-violet-300"
            >
              Docs & API
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-violet-300"
            >
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white">
              Sign In
            </button>
            <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500 hover:shadow-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 pt-20 pb-16 text-center lg:pt-28">
          <div className="mx-auto max-w-4xl">
            {/* Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse" />
              <span>Next-Gen Web & API Documentation Digesting</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
              Transform Dense Web Docs into{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
                Structured Briefs
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
              DocDigest distills API specifications, technical blogs, and long-form web content into clean, actionable summaries, code patterns, and key takeaways in seconds.
            </p>

            {/* Interactive URL Input Mock */}
            <div className="mx-auto mt-10 max-w-2xl">
              <div className="group relative rounded-2xl border border-violet-500/20 bg-zinc-900/70 p-2 shadow-2xl backdrop-blur-xl transition-all hover:border-violet-500/40 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/30">
                <div className="flex items-center gap-3 px-3">
                  <svg
                    className="h-5 w-5 text-violet-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <input
                    type="url"
                    placeholder="Paste web page URL or technical documentation link..."
                    className="w-full bg-transparent py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                    defaultValue="https://docs.nextjs.org/app/building-your-application/routing"
                    readOnly
                  />
                  <button className="flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-600/30 transition-all hover:bg-violet-500 hover:shadow-violet-500/40 focus:ring-2 focus:ring-violet-500">
                    <span>Digest Now</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-500">
                <span>Supported: Markdown, HTML, OpenAPI, GitHub Docs</span>
                <span>•</span>
                <span className="text-violet-400 font-mono">Fast AI Processing</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Engineered for Developers & Researchers
            </h2>
            <p className="mt-2 text-zinc-400">
              Purpose-built tools to parse complex content without cognitive overload.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-violet-500/15 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-violet-900/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                Technical Doc Parsing
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Extract core architecture, code patterns, and configuration options from long technical documentations automatically.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-violet-500/15 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-violet-900/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                Instant Key Takeaways
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Get bulleted executive summaries, actionable insights, and highlighted code snippets without reading filler text.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-violet-500/15 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-violet-900/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-400 ring-1 ring-fuchsia-500/20 group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                Code Snippet Extraction
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Automatically gather and format code samples, API parameters, and code blocks into clean, copyable markdown.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-500/10 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} DocDigest. Built with Next.js & Tailwind CSS.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-violet-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-violet-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-violet-400 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

