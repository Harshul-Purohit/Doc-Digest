import { connectToDatabase } from '@/lib/db';
import { getClientIp } from '@/lib/ip';
import { Usage } from '@/models/Usage';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const identifier = getClientIp(req);
    const usage = await Usage.findOne({ identifier });
    const count = usage ? usage.count : 0;
    const limit = 3;
    const remaining = Math.max(0, limit - count);

    return Response.json({
      count,
      limit,
      remaining,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Database connection failed';
    console.warn('⚠️ Usage status DB check failed, using fallback:', errorMessage);
    return Response.json(
      {
        count: 0,
        limit: 3,
        remaining: 3,
        warning: 'Database offline, running in mock mode',
      },
      { status: 200 }
    );
  }
}
