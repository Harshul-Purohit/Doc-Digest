import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { signToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return Response.json(
        { error: 'Request body must be a valid JSON object.' },
        { status: 400 }
      );
    }

    const { email, password } = body as { email?: string; password?: string };

    if (!email || typeof email !== 'string') {
      return Response.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return Response.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return Response.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `${TOKEN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );

    return Response.json(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        },
        message: 'Logged in successfully.',
      },
      { status: 200, headers }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed.';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
