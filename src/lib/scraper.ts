import * as cheerio from 'cheerio';

/**
 * Interface representing the extracted web page data.
 */
export interface ScrapedData {
  url: string;
  title: string;
  content: string;
}

/**
 * Validates whether a target string is a valid HTTP or HTTPS URL.
 *
 * @param targetUrl - The URL string to validate.
 * @returns True if valid HTTP/HTTPS URL, false otherwise.
 */
export function isValidUrl(targetUrl: string): boolean {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(targetUrl);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Default timeout in milliseconds for HTML fetch requests.
 */
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Maximum character limit for scraped content (~12,000 characters).
 */
const MAX_CONTENT_LENGTH = 12000;

/**
 * Standard browser User-Agent header to avoid basic bot blocking.
 */
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Fetches raw HTML content from a given URL with browser headers and timeout handling.
 *
 * @param url - The URL to fetch.
 * @param timeoutMs - Request timeout in milliseconds (default: 10000ms).
 * @returns Promise resolving to the raw HTML string.
 * @throws Detailed Error if URL is invalid, request times out, or network/HTTP errors occur.
 */
export async function fetchHtml(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<string> {
  if (!isValidUrl(url)) {
    throw new Error(
      `Invalid URL provided: "${url}". Please provide a valid HTTP or HTTPS URL.`
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`HTTP 404 Not Found: Page does not exist at ${url}`);
      }
      if (response.status === 403) {
        throw new Error(
          `HTTP 403 Forbidden: Access denied by target host at ${url}`
        );
      }
      throw new Error(
        `HTTP Error ${response.status} (${response.statusText}): Failed to fetch ${url}`
      );
    }

    const html = await response.text();
    return html;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(
          `Request timed out after ${timeoutMs}ms while attempting to fetch ${url}`
        );
      }
      // Re-throw custom detailed HTTP errors directly
      if (
        error.message.startsWith('HTTP ') ||
        error.message.startsWith('Invalid URL')
      ) {
        throw error;
      }
      throw new Error(
        `Unreachable host or network error (${error.message}): Unable to fetch ${url}`
      );
    }
    throw new Error(`Unknown error occurred while fetching ${url}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Scrapes a web page given its URL, returning extracted title and normalized body text.
 *
 * @param url - The target web page URL.
 * @returns Promise resolving to `ScrapedData`.
 * @throws Error if URL validation fails or fetching/parsing fails.
 */
export async function scrapePage(url: string): Promise<ScrapedData> {
  const html = await fetchHtml(url);

  const $ = cheerio.load(html);

  // Strip noise tags: script, style, noscript, nav, footer, header, svg, iframe, form
  $('script, style, noscript, nav, footer, header, svg, iframe, form').remove();

  // Extract title with fallbacks: og:title -> <title> -> <h1> -> twitter:title -> default
  const title =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('title').first().text().trim() ||
    $('h1').first().text().trim() ||
    $('meta[name="twitter:title"]').attr('content')?.trim() ||
    'Untitled Page';

  // Extract body text (or root text if body tag missing)
  let rawText = $('body').length > 0 ? $('body').text() : $.text();

  // Normalize line breaks, tabs, and excess whitespace
  rawText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ');

  const lines = rawText
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line.length > 0);

  let cleanContent = lines.join('\n\n');

  // Truncate content safely to ~12,000 characters
  if (cleanContent.length > MAX_CONTENT_LENGTH) {
    let truncated = cleanContent.slice(0, MAX_CONTENT_LENGTH);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');
    const cutIndex = Math.max(lastPeriod, lastNewline);

    if (cutIndex > MAX_CONTENT_LENGTH * 0.8) {
      truncated = truncated.slice(0, cutIndex + 1);
    }

    cleanContent = truncated.trim() + '\n\n[Content truncated...]';
  }

  return {
    url,
    title,
    content: cleanContent,
  };
}
