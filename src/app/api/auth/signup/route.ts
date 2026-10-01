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

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return Response.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return Response.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
    });

    const token = signToken({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `${TOKEN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );

    return Response.json(
      {
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          role: newUser.role,
        },
        message: 'Account created successfully.',
      },
      { status: 201, headers }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Signup failed.';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
