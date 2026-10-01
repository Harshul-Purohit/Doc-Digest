import { TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    `${TOKEN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );

  return Response.json(
    { message: 'Logged out successfully.' },
    { status: 200, headers }
  );
}
