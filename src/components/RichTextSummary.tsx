import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

interface RichTextSummaryProps {
  content: string;
}

function CodeBlockHeader({
  language,
  onCopy,
  copied,
}: {
  language: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-violet-500/20 bg-zinc-950 px-4 py-2 text-xs text-zinc-400 font-mono">
      <span className="text-violet-300 font-semibold">{language}</span>
      <button
        type="button"
        onClick={onCopy}
        className="flex items-center gap-1.5 rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[11px] text-violet-200 transition-all hover:bg-violet-600 hover:text-white"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-300">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
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
                <code className="block font-mono text-xs text-violet-200 whitespace-pre-wrap break-words" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded-md border border-violet-500/30 bg-zinc-950/90 px-1.5 py-0.5 font-mono text-xs font-medium text-violet-200 break-words"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            // Extract raw text for code block copy functionality
            const rawText = React.Children.toArray(children)
              .map((child: any) => (child?.props?.children ? String(child.props.children) : ''))
              .join('');

            const languageMatch = React.Children.toArray(children)
              .map((child: any) => child?.props?.className)
              .find((cls) => typeof cls === 'string' && cls.includes('language-'));

            const language = languageMatch ? languageMatch.replace('language-', '') : 'code';

            const CodeBlockContainer = () => {
              const [copiedCode, setCopiedCode] = useState(false);

              const handleCopyCode = async () => {
                try {
                  await navigator.clipboard.writeText(rawText || String(children));
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                } catch (err) {
                  console.error('Failed to copy code', err);
                }
              };

              return (
                <div className="group relative my-4 overflow-hidden rounded-xl border border-violet-500/25 bg-zinc-950 shadow-xl backdrop-blur-md glow-purple-sm">
                  <CodeBlockHeader
                    language={language}
                    onCopy={handleCopyCode}
                    copied={copiedCode}
                  />
                  <pre className="overflow-x-auto p-4 font-mono text-xs text-violet-100 whitespace-pre-wrap break-words leading-relaxed">
                    {children}
                  </pre>
                </div>
              );
            };

            return <CodeBlockContainer />;
          },
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
