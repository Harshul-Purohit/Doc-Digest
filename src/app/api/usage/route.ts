import { connectToDatabase } from '@/lib/db';
import { getClientIp } from '@/lib/ip';
import { getUserFromRequest } from '@/lib/auth';
import { DailyUsage } from '@/models/DailyUsage';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC

    if (user && user.role === 'admin') {
      return Response.json({
        count: 0,
        limit: 'Unlimited',
        remaining: 'Unlimited',
        role: 'admin',
      });
    }

    const identifier = user ? user.id : getClientIp(req);

    await connectToDatabase();

    const usage = await DailyUsage.findOne({ identifier, date: todayStr });
    const count = usage ? usage.count : 0;
    const limit = 3;
    const remaining = Math.max(0, limit - count);

    return Response.json({
      count,
      limit,
      remaining,
      role: user ? user.role : 'guest',
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
        role: 'guest',
        warning: 'Database offline, running fallback mode',
      },
      { status: 200 }
    );
  }
}
