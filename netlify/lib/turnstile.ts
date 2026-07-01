// Verifies a Cloudflare Turnstile token server-side. Dormant until
// TURNSTILE_SECRET_KEY is set (and the front-end sends a token): with no secret
// configured it returns true so it can't break a live form. Once the secret is
// set, a missing or invalid token is rejected.
export async function turnstilePassed(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
