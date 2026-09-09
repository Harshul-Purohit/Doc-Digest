import React from 'react';
import ReactMarkdown from 'react-markdown';

interface RichTextSummaryProps {
  content: string;
}

export function RichTextSummary({ content }: RichTextSummaryProps) {
  return (
    <div className="prose prose-invert max-w-none text-zinc-300">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mt-6 mb-4 border-b border-violet-500/20 pb-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 mb-3 border-b border-violet-500/10 pb-2 text-xl font-bold tracking-tight text-violet-300 sm:text-2xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 text-lg font-semibold tracking-tight text-purple-200">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-zinc-300">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 space-y-2 pl-6 list-disc text-zinc-300 marker:text-violet-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-2 pl-6 list-decimal text-zinc-300 marker:text-violet-400 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-5 rounded-r-xl border-l-4 border-violet-500 bg-violet-950/20 py-3 px-4 text-zinc-200 italic shadow-inner">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 font-medium underline underline-offset-4 decoration-violet-500/40 transition-colors hover:text-violet-300 hover:decoration-violet-400"
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes('language-') || String(children).includes('\n');
            if (isBlock) {
              return (
                <code className="block w-full font-mono text-xs text-violet-200" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded-md border border-violet-500/30 bg-violet-950/50 px-1.5 py-0.5 font-mono text-xs font-medium text-violet-200"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-xl border border-violet-500/20 bg-zinc-950/90 p-4 font-mono text-xs text-zinc-200 shadow-xl backdrop-blur-md">
              {children}
            </pre>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),
          hr: () => (
            <hr className="my-6 border-violet-500/20" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
