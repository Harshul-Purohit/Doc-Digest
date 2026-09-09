import { isValidUrl, scrapePage } from '@/lib/scraper';
import { buildSummaryPrompt, streamSummary } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: 'Invalid JSON payload in request body.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return Response.json(
        { error: 'Request body must be a valid JSON object.' },
        { status: 400 }
      );
    }

    const { url } = body as { url?: string };

    if (!url || typeof url !== 'string' || !isValidUrl(url)) {
      return Response.json(
        { error: 'A valid HTTP or HTTPS URL is required.' },
        { status: 400 }
      );
    }

    let scrapedData;
    try {
      scrapedData = await scrapePage(url);
    } catch (scrapeError: unknown) {
      const errorMessage =
        scrapeError instanceof Error
          ? scrapeError.message
          : 'Failed to scrape the specified URL.';
      return Response.json({ error: errorMessage }, { status: 422 });
    }

    const prompt = buildSummaryPrompt({
      title: scrapedData.title,
      url: scrapedData.url,
      content: scrapedData.content,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamSummary(prompt)) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (streamError: unknown) {
          const errorMessage =
            streamError instanceof Error
              ? streamError.message
              : 'Streaming generation failed.';
          controller.error(new Error(errorMessage));
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected server error occurred while processing your request.';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
