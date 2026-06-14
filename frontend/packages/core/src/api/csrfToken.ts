// CSRF token resolution for mutating requests.
//
// The Rails-rendered shell injects `<meta name="csrf-token">`, but a hard load
// of an SPA subroute can be served a static shell without it. In that case the
// host primes a token fetched from GET /get_token via setSpaCsrfToken.

let spaCsrfToken: string | null = null;

export function setSpaCsrfToken(token: string | null): void {
  spaCsrfToken = token;
}

export function getSpaCsrfToken(): string | null {
  return spaCsrfToken;
}

function metaCsrfToken(): string | null {
  return (
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
      ?.content ?? null
  );
}

export function resolveCsrfToken(): string | null {
  // A fetched token is requested at or after page load, so it is at least as
  // fresh as the frozen page-load meta — and strictly fresher after a
  // server-side token rotation (e.g. signing out other sessions). Prefer it;
  // fall back to the meta only when nothing has been fetched.
  return spaCsrfToken ?? metaCsrfToken();
}

// Re-fetch the session CSRF token from GET /get_token (returned in the
// `csrf-token` response header, with an empty body) and store it. Call after a
// server action that rotates the session token. A failure is swallowed — the
// next mutation surfaces a stale token if one was needed.
export async function refreshCsrfToken(): Promise<void> {
  try {
    const response = await fetch('/get_token', {credentials: 'same-origin'});
    const token = response.headers.get('csrf-token');
    if (token) setSpaCsrfToken(token);
  } catch {
    // leave the current token in place
  }
}
