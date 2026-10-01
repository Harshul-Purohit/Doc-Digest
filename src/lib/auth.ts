import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'docdigest_jwt_secret_key_2026_default';
export const TOKEN_COOKIE_NAME = 'docdigest_session';

export interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Signs a JWT token containing user identity and role.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a JWT token and returns decoded user payload or null if invalid.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded && decoded.id && decoded.email) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies user payload from a Request's cookies or Authorization header.
 */
export function getUserFromRequest(request: Request): JwtPayload | null {
  try {
    // 1. Try cookie
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map((c) => {
          const [key, ...val] = c.trim().split('=');
          return [key, val.join('=')];
        })
      );

      const token = cookies[TOKEN_COOKIE_NAME];
      if (token) {
        const verified = verifyToken(token);
        if (verified) return verified;
      }
    }

    // 2. Try Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const verified = verifyToken(token);
      if (verified) return verified;
    }

    return null;
  } catch {
    return null;
  }
}
