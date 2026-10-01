import { connectToDatabase } from '@/lib/db';
import { getClientIp } from '@/lib/ip';
import { isValidUrl, scrapePage } from '@/lib/scraper';
import { buildSummaryPrompt, streamSummary } from '@/lib/gemini';
import { getUserFromRequest } from '@/lib/auth';
import { DailyUsage } from '@/models/DailyUsage';
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

    const user = getUserFromRequest(request);
    const todayStr = new Date().toISOString().split('T')[0]; // UTC date (YYYY-MM-DD)
    let identifier = getClientIp(request);
    if (user && user.id) {
      identifier = user.id;
    }

    let dbConnected = false;
    try {
      await connectToDatabase();
      dbConnected = true;
    } catch (dbError) {
      console.warn(
        '⚠️ Database connection failed. Proceeding with summary without persistence:',
        dbError
      );
    }

    // Rate Limiting Check (Admins bypass limit)
    const isAdmin = user?.role === 'admin';
    if (dbConnected && !isAdmin) {
      try {
        let usage = await DailyUsage.findOne({ identifier, date: todayStr });
        if (!usage) {
          usage = new DailyUsage({ identifier, date: todayStr, count: 0 });
        }

        if (usage.count >= 3) {
          return Response.json(
            {
              error:
                'Free generation limit reached (3/3 for today). Limit resets at midnight UTC.',
            },
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

          if (dbConnected && fullSummary.trim().length > 0) {
            try {
              await Summary.create({
                userId: user ? user.id : undefined,
                url,
                title: scrapedData.title,
                summary: fullSummary,
              });
            } catch (dbError) {
              console.error('Failed to save summary to database:', dbError);
            }
          }
        } catch (streamError: unknown) {
          console.error('Stream generation error:', streamError);
          controller.enqueue(
            encoder.encode(
              '\n\n> ⚠️ **Service Notice:** Google Gemini is currently under high load. Please try again in a few moments.'
            )
          );
          controller.close();
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
