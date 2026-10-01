import { GoogleGenAI } from '@google/genai';

/**
 * Validates and retrieves the Gemini API key from environment variables.
 */
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    'GEMINI_API_KEY is missing from environment variables. Please define it in your .env.local file.'
  );
}

/**
 * Initialized GoogleGenAI client instance using official @google/genai SDK.
 */
export const ai = new GoogleGenAI({ apiKey });

export interface SummaryPromptPayload {
  title: string;
  url: string;
  content: string;
}

export type TextStreamChunk = string;

/**
 * Helper function to delay execution for a given number of milliseconds.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Checks if an error is considered transient/retryable (503, 429, rate limits, server capacity).
 */
function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const normalized = msg.toLowerCase();
  return (
    normalized.includes('503') ||
    normalized.includes('429') ||
    normalized.includes('high demand') ||
    normalized.includes('service unavailable') ||
    normalized.includes('resource_exhausted') ||
    normalized.includes('too many requests') ||
    normalized.includes('overloaded') ||
    normalized.includes('unavailable') ||
    normalized.includes('quota')
  );
}

/**
 * Builds a structured prompt instructing Gemini to generate an executive technical summary.
 */
export function buildSummaryPrompt(payload: SummaryPromptPayload): string {
  const sanitizedTitle = (payload.title || 'Untitled Document').trim();
  const sanitizedUrl = (payload.url || '').trim();
  const sanitizedContent = (payload.content || '').trim();

  return `You are an expert technical documentation summarizer and Principal Software Architect.
Your task is to analyze the provided web page content and produce an executive, high-signal technical digest.

Target Page Title: ${sanitizedTitle}
Source URL: ${sanitizedUrl}

--- BEGIN SOURCE CONTENT ---
${sanitizedContent}
--- END SOURCE CONTENT ---

Instructions & Output Format Requirements:
- Respond in strict GitHub-Flavored Markdown (GFM).
- Structure your response EXACTLY matching this markdown template hierarchy:

# ${sanitizedTitle}
> Source: [${sanitizedUrl}](${sanitizedUrl})

## Quick TL;DR
(2-3 punchy sentences summarizing the core proposition)

## Key Takeaways
(Concise bullet points highlighting architecture, mechanisms, or features with bold key terms)

## Core Architecture & Technical Details
(In-depth breakdown of concepts, design choices, API specifications, or code highlights if found)

## Notable Resources & References
(List any key documentation links, GitHub repos, or tools mentioned in the context, or omit if none)

Constraints:
- Do not hallucinate content not present in the provided text.
- Maintain an objective, high-signal developer tone.
- Avoid fluff, filler greetings, or conversational sign-offs.`;
}

/**
 * List of fallback models to attempt if the primary model is unavailable or overloaded.
 */
const MODEL_FALLBACK_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

/**
 * Asynchronously streams response chunks from Google Gemini with automatic retries and model fallback.
 *
 * @param prompt - The input prompt text.
 * @returns AsyncGenerator yielding TextStreamChunk fragments.
 */
export async function* streamSummary(
  prompt: string
): AsyncGenerator<TextStreamChunk, void, unknown> {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Invalid or empty prompt provided to streamSummary.');
  }

  let lastError: unknown = null;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    // Retry up to 2 times (3 attempts total per model) with a 1.5s delay
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const responseStream = await ai.models.generateContentStream({
          model: modelName,
          contents: prompt,
        });

        // Test stream iteration and yield chunks
        let chunksYielded = 0;
        for await (const chunk of responseStream) {
          if (chunk.text) {
            chunksYielded++;
            yield chunk.text;
          }
        }

        // If we successfully streamed content, we are done
        if (chunksYielded > 0) {
          return;
        }
      } catch (error: unknown) {
        lastError = error;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn(
          `⚠️ Model ${modelName} attempt ${attempt + 1}/${maxRetries + 1} failed: ${errorMsg}`
        );

        if (isRetryableError(error) && attempt < maxRetries) {
          console.log(`⏱️ Waiting 1.5s before retry ${attempt + 1}...`);
          await sleep(1500);
          continue;
        }

        // If not retryable or max retries exceeded for this model, break loop to try fallback model
        break;
      }
    }
  }

  // If all models and retries failed
  const finalMessage =
    lastError instanceof Error
      ? lastError.message
      : 'All Gemini models are currently unavailable.';
  throw new Error(`Google Gemini stream error: ${finalMessage}`);
}
