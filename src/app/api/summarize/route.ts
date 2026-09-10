import { connectToDatabase } from '@/lib/db';
import { getClientIp } from '@/lib/ip';
import { isValidUrl, scrapePage } from '@/lib/scraper';
import { buildSummaryPrompt, streamSummary } from '@/lib/gemini';
import { Usage } from '@/models/Usage';
import { Summary } from '@/models/Summary';

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

    let dbConnected = false;
    let identifier = '127.0.0.1';

    try {
      await connectToDatabase();
      dbConnected = true;
      identifier = getClientIp(request);
    } catch (dbError) {
      console.warn(
        '⚠️ Database connection failed. Proceeding with summary without rate-limiting/persistence:',
        dbError
      );
    }

    if (dbConnected) {
      try {
        let usage = await Usage.findOne({ identifier });
        if (!usage) {
          usage = new Usage({ identifier, count: 0, lastUsedAt: new Date() });
        }

        if (usage.count >= 3) {
          return Response.json(
            { error: 'Free generation limit reached (3/3). Please upgrade to continue.' },
            { status: 429 }
          );
        }

        usage.count += 1;
        usage.lastUsedAt = new Date();
        await usage.save();
      } catch (usageError) {
        console.warn(
          '⚠️ Usage verification/increment failed, allowing request:',
          usageError
        );
      }
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

    let fullSummary = '';
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamSummary(prompt)) {
            fullSummary += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();

          if (dbConnected) {
            try {
              await Summary.create({
                url,
                title: scrapedData.title,
                summary: fullSummary,
              });
            } catch (dbError) {
              console.error('Failed to save summary to database:', dbError);
            }
          }
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
