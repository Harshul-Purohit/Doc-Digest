import { GoogleGenAI } from '@google/genai';

/**
 * Validates and retrieves the Gemini API key from environment variables.
 * Throws a descriptive error if missing.
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

/**
 * Interface representing the payload required to build a structured summary prompt.
 */
export interface SummaryPromptPayload {
  title: string;
  url: string;
  content: string;
}

/**
 * Type definition for text stream chunks yielded during response generation.
 */
export type TextStreamChunk = string;

/**
 * Builds a structured prompt instructing Gemini to generate an executive technical summary
 * matching strict GitHub-Flavored Markdown (GFM) hierarchy and formatting rules.
 *
 * @param payload - The scraped page details containing title, url, and clean content.
 * @returns Formatted prompt string ready for Gemini generation.
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
 * Asynchronously streams response chunks from Google Gemini using gemini-2.5-flash.
 * Falls back to gemini-3.6-flash if gemini-2.5-flash is deprecated/unavailable for the active API key.
 *
 * @param prompt - The input prompt text.
 * @returns AsyncGenerator yielding TextStreamChunk (string) fragments as they arrive.
 * @throws Detailed Error if stream generation fails or encounters network/quota issues.
 */
export async function* streamSummary(
  prompt: string
): AsyncGenerator<TextStreamChunk, void, unknown> {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Invalid or empty prompt provided to streamSummary.');
  }

  let responseStream;

  try {
    try {
      responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
    } catch (primaryError: unknown) {
      const errorMsg = primaryError instanceof Error ? primaryError.message : String(primaryError);
      // Fallback if gemini-2.5-flash returns deprecation / NOT_FOUND error from Google API
      if (
        errorMsg.includes('gemini-2.5-flash') ||
        errorMsg.includes('NOT_FOUND') ||
        errorMsg.includes('404')
      ) {
        responseStream = await ai.models.generateContentStream({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });
      } else {
        throw primaryError;
      }
    }

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Gemini API Streaming Error: ${error.message}`);
    }
    throw new Error(
      'An unexpected error occurred while streaming content from Google Gemini.'
    );
  }
}
