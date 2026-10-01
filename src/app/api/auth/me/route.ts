import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return Response.json({ user: null }, { status: 200 });
    }

    try {
      await connectToDatabase();
      const user = await User.findById(payload.id).select('-password');
      if (user) {
        return Response.json({
          user: {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          },
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ DB lookup for user failed, falling back to payload:', dbErr);
    }

    return Response.json({
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Auth verification failed.';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
